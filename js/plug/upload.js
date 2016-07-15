var Upload = {
    'maxWidth': 600,
    'maxHeight': 600,
    'rate': 1,
    'url': 'upload.php',
    'x': 0,
    'y': 0,
    'w': 0,
    'h': 0,
    'clacImgZoomParam': function(maxWidth, maxHeight, width, height) {
        var param = { top: 0, left: 0, width: width, height: height };
        if (maxWidth) {
            rateWidth = width / maxWidth;
            rateHeight = height / maxHeight;
            if (rateWidth > rateHeight) {
                param.width = maxWidth;
                param.height = Math.round(height / rateWidth);
                Upload.rate = rateWidth;
            } else {
                param.width = Math.round(width / rateHeight);
                param.height = maxHeight;
                Upload.rate = rateHeight;
            }
        }
        return param;
    },
    'change': function(file) {
        // Get a reference to the fileList
        var files = !!file.files ? file.files : [];
        // If no files were selected, or no FileReader support, return
        if (!files.length || !window.FileReader) return;

        // Create a new instance of the FileReader
        var reader = new FileReader();

        // Read the local file as a DataURL
        reader.readAsDataURL(files[0]);
        // When loaded, set image data as background of div
        reader.onloadend = function() {
            var img = $('#target');
            img.attr("src", this.result);
            // $("#view_photo").attr("src",this.result);
                /* Act on the event */
                var img = $('#target');
                var rect = Upload.clacImgZoomParam(Upload.maxWidth, Upload.maxHeight, img.width(), img.height());
                img.width(rect.width);
                img.height(rect.height);
                setTimeout(function() {
                    console.log('i will do it');
                    img.Jcrop();
                }, 2000);
        }
    },
};
