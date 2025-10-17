$(function () {
    app.drawDefaultImage();
    app.initCanvasEvents();

    $("#saveBlueprintBtn").on("click", app.saveOrUpdateBlueprint);
    $("#deleteBlueprintBtn").on("click", app.deleteBlueprint);
    $("#createBlueprintConfirm").on("click", app.uploadBlueprint);

    $("#newBlueprintBtn").on("click", () => {
        $("#newBlueprintModal").show();
    });

    $("#cancelModalBtn").on("click", () => {
        $("#newBlueprintModal").hide();
    });

    $(document).on("contextmenu", e => e.preventDefault());

    $(globalThis).on("resize", () => {
    const canvas = document.getElementById("blueprintCanvas");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    app.repaintBlueprint();
    });

    const triggerBlueprintSearch = () => {
        const author = $("#searchQuery").val().trim();
        if (author) {
            app.updateBlueprints(author);
        } else {
            alert("Please enter an author name.");
        }
    };

    $(".search-icon").on("click", triggerBlueprintSearch);
    $("#searchQuery").on("keydown", e => {
        if (e.key === "Enter") triggerBlueprintSearch();
    });
});