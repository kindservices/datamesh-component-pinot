<script lang="ts">

    //
    // this is an ugly slider control which allows the user to drag a range
    // 
    // the resulting outputs are 'minPercent' and 'maxPercent', which can be used
    // to inform other controls' reactions to the range (e.g. by updating query parameters)
    //
    // this control was started from
    // https://coderpad.io/blog/development/how-to-build-a-draggable-slider-with-javascript/
    //
    // SVG reference is here:
    // https://coderpad.io/blog/development/how-to-build-a-draggable-slider-with-javascript/
    //
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';

    // send perent update events
	const dispatch = createEventDispatcher();

    // ==========================================
    // variables for supporting dragging/resizing
    let userGrabbingSlider = false;
    let userGrabbingLeftHandle = false;
    let userGrabbingRightHandle = false;

    $: userGrabbing = userGrabbingSlider || userGrabbingLeftHandle || userGrabbingRightHandle;

    let grabXOffset = 0;
    let initialCursorDownX = 0;
    
    // needed to baseline the width for when we're adjusting the width
    let initialCursorDownSliderWidth = 0;

    export let width = window.innerWidth
    export let height : number = 50

    // ==========================================
    // styles
    export let barStyle = "fill:rgb(0,0,0);stroke-width:1;stroke:rgb(0,0,0);fill-opacity:0.05"
    export let sliderStyle = "fill:rgb(0,0,0);stroke-width:1;stroke:rgb(0,0,255);fill-opacity:0.25"
    export let handleStyle = "fill:rgb(0,0,255);stroke-width:1;stroke:rgb(0,0,255);fill-opacity:0.80"

    // ==========================================
    // bar
    export let barWidth = width * 0.9
    export let barHeight = 40
    export let barX1 = (width - barWidth) / 2
    export let barY1 = 0
    $: barX2 = barX1 + barWidth

    // ==========================================
    // slider
    export let sliderMargin = 8
    let sliderWidth = barWidth * 0.5 
    let sliderHeight = barHeight - (sliderMargin * 2)

    let sliderMinX = barX1 + sliderMargin
    $: sliderMaxX2 = barX2 - sliderMargin
    $: sliderMaxX = sliderMaxX2 - sliderWidth

    let sliderX1 = barX1 + sliderMargin
    let sliderY1 = barY1 + sliderMargin
    $: sliderX2 = sliderX1 + sliderWidth
    $: sliderY2 = sliderY1 + sliderHeight


    // ==========================================
    // handles
    export let handleWidth = 12

    $: handleLeftX1 = sliderX1
    $: handleLeftX2 = handleLeftX1 + handleWidth

    $: handleRightX1 = sliderX2 - handleWidth
    $: handleRightX2 = sliderX2

    // ==========================================
    // outputs so that other controls can react 
    // to the user input. They'll presumably use
    // the min/max percents to calculate whatever
    // range they want
    let barRange = barWidth - (sliderMargin * 2)

    // see https://svelte.dev/tutorial/component-events
    $: minPercent = Math.max(0, (sliderX1 - sliderMinX) / barRange)
    $: maxPercent = Math.min(1, 1 - ((sliderMaxX2 - sliderX2) / barRange))
    

    const intersectsSliderX = (x: number) => x >= sliderX1 && x <= sliderX2;
    const intersectsSliderY = (y: number) => y >= sliderY1 && y <= sliderY2;
    const intersectsLeftHandleX = (x: number) => x >= handleLeftX1 && x <= handleLeftX2;
    const intersectsRightHandleX = (x: number) => x >= handleRightX1 && x <= handleRightX2;

    const intersectsSlider = (x : number, y : number) => intersectsSliderY(y) && intersectsSliderX(x);


    function downCursorState() {
        if (userGrabbingSlider) {
            return "grabbing"
        } else if (userGrabbingLeftHandle || userGrabbingRightHandle) {
            return "col-resize"
        } else {
            return "default"
        }
    }

    function hoverCursorState(cursorX: number, cursorY: number) {
        if (intersectsSliderY(cursorY)) {
            if (intersectsLeftHandleX(cursorX)) {
                return "col-resize"
            } else if (intersectsRightHandleX(cursorX)) {
                return "col-resize"
            } else if (intersectsSliderX(cursorX)) {
                return "grab"
            }
        }
        return "default"
    }

    function initListeners(slider) {
        window.addEventListener("mousedown", (e) => {
            const cursorX = e.offsetX;
            const cursorY = e.offsetY;
            
            if (intersectsSliderY(cursorY)) {
                if (intersectsLeftHandleX(cursorX)) {
                    userGrabbingLeftHandle = true;
                } else if (intersectsRightHandleX(cursorX)) {
                    userGrabbingRightHandle = true;                  
                } else if (intersectsSliderX(cursorX)) {
                    userGrabbingSlider = true;
                }

                if (userGrabbingSlider || userGrabbingLeftHandle || userGrabbingRightHandle) {
                    grabXOffset = cursorX - sliderX1
                    initialCursorDownX = cursorX
                    initialCursorDownSliderWidth = sliderWidth
                    document.body.style.cursor = downCursorState();
                }
            }
        });
        
        window.addEventListener("mouseup", (e) => {
            userGrabbingLeftHandle = false;
            userGrabbingRightHandle = false;
            userGrabbingSlider = false;

            const cursorX = e.offsetX;
            const cursorY = e.offsetY;
            document.body.style.cursor = hoverCursorState(cursorX, cursorY)
        });

        function updateSliderX1(cursorX : number) {
            let x = cursorX - grabXOffset;
            sliderX1 = Math.min(sliderMaxX, Math.max(sliderMinX, x));
        }
        
        window.addEventListener("mousemove", (e) => {
            const cursorX = e.offsetX;
            const cursorY = e.offsetY;
            
            // if this isn't a grab action, reset the cursor and short-circuit
            if (!userGrabbing) {
                document.body.style.cursor = hoverCursorState(cursorX, cursorY);
                return;
            }

            e.preventDefault();
            document.body.style.cursor = downCursorState();

            var rangeUpdated = true
            if (userGrabbingSlider) {
                updateSliderX1(cursorX)
            } else if (userGrabbingLeftHandle) {
                // restrict the left handle to within the range
                const leftHandleInRange = cursorX >= sliderMinX && cursorX <= sliderX2 - handleWidth
                if (leftHandleInRange) {
                    let newWidth = initialCursorDownSliderWidth + initialCursorDownX - cursorX
                    sliderWidth = Math.max(0, newWidth)
                    updateSliderX1(cursorX)
                } else {
                    rangeUpdated = false
                }
            } else if (userGrabbingRightHandle) {
                // restrict the left handle to within the range
                const rightBarInRange = cursorX >= sliderX1 + handleWidth && cursorX <= sliderMaxX2

                if (rightBarInRange) {
                    let newWidth = initialCursorDownSliderWidth + cursorX - initialCursorDownX
                    sliderWidth = Math.max(0, newWidth)
                } else {
                    rangeUpdated = false
                }
            } else {
                rangeUpdated = false
            }

            
            if (rangeUpdated) {
                dispatch('rangeChanged', {
                    minPercent: minPercent,
                    maxPercent: maxPercent
                });
            }
        });
    }

	onMount(() => {
        const sliderBar = document.getElementById("slider-bar")
        initListeners(sliderBar)

        // fire our initial event
        dispatch('rangeChanged', {
            minPercent: minPercent,
            maxPercent: maxPercent
        });
    });


</script>


<svg {width} {height} >

    <!-- bar -->
    <rect
    x={barX1}
    y={barY1}
    width={barWidth}
    height={barHeight}
    style={barStyle}
  />

    <!-- slider -->
    <rect
        id="slider-bar"
        x={sliderX1}
        y={sliderY1}
        width={sliderWidth}
        height={sliderHeight}
        style={sliderStyle}
    />


    <!-- left handle -->
    <rect
        x={handleLeftX1}
        y={sliderY1}
        width={handleWidth}
        height={sliderHeight}
        style={handleStyle}
    />

    <!-- right handle -->
    <rect
        x={handleRightX1}
        y={sliderY1}
        width={handleWidth}
        height={sliderHeight}
        style={handleStyle}
    />
</svg>