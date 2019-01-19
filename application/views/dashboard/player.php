
<video id='hls-video'>
<source src='<?=$registro['link'];?>' type='application/x-mpegURL'/>
</video>

<script>
fluidPlayer(
    'hls-video',
    {
        layoutControls: {
            fillToContainer: true
        }
    }
);
</script>
