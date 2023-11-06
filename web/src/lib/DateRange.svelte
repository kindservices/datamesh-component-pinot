<script lang="ts">

    import * as jsdate from "@js-joda/core";

    const formatter = jsdate.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");
    let accessor = formatter.parse("2023-11-06 14:44:00.000"); 
    let date = jsdate.LocalDateTime.from(accessor);
    
    let incrementInMinutes = 3
    let numBars = 10

    let range = Array.from({ length: numBars }, (_, index) => index + 1);
</script>

<div>
    {#each range as r, i}
    {r}: {formatter.format(date.plusMinutes(i * incrementInMinutes))}
    <br/>
    {/each}
    
    
</div>