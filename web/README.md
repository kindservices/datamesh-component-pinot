# About

This project showcases an apache pinot source and sink.

## TODO
 [ ] get apache pinot installed on k8s (by hook or by crookes) as a Make target
     out of scope for now: doing this via argo
 [ ] create a 'test' web component which can push data into pinot
     next: can we do this via kafka?
 [ ] create a dashboard web component w/ websocket to graph the data coming out of pinot
 

## Running / Testing 
See the [Makefile](./Makefile) for build targets

To test locally, you can use `make run`, then open either [a static test page](./test/local-test.html) or a [dynamic load](./test/dynamic-test.html) in your browser


# References
See [here](https://www.colorglare.com/svelte-components-as-web-components-b400d1253504)
and [here](https://medium.com/javascript-by-doing/how-to-create-a-web-component-in-svelte-5963356ec978)