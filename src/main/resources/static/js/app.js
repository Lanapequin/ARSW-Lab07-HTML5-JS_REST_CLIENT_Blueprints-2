let app = (function() {
    let author = '';
    let blueprints = [];
    let api = apiclient;
    let currentBlueprint = null;

    $(globalThis).on("resize", () => {
        if (currentBlueprint) {
            app.resizeCanvas(() => {
                app.repaintBlueprint();
            });
        }
    });

    function resizeCanvas(callback) {
        const canvas = document.getElementById("blueprintCanvas");
        requestAnimationFrame(() => {
            const rect = canvas.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                canvas.width = rect.width;
                canvas.height = rect.height;
                console.log("Canvas resized to:", canvas.width, canvas.height);
                if (typeof callback === "function") {
                    callback();
                }
            } else {
                console.warn("Canvas not ready for resizing.");
            }
        });
    }

    function drawDefaultImage() {
        const canvas = document.getElementById("blueprintCanvas");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function setAuthor(newAuthor) {
        author = newAuthor;
    }

    function updateBlueprints(authorName) {
        setAuthor(authorName);
        api.getBlueprintsByAuthor(author, function (data) {
            if (!data || data.length === 0) {
                $("#user-message").text(`No blueprints found for "${author}".`);
                $(".message").show();
                $(".left-panel").hide();
                $(".right-panel").hide();
                return;
            }

            blueprints = data.map(function (bp) {
                return {
                    name: bp.name,
                    points: bp.points.length
                };
            });

            $(".message").hide();
            $(".left-panel").show();
            requestAnimationFrame(() => {
                resizeCanvas();
                drawDefaultImage();
            });
            $(".right-panel").show();
            $("#searchQuery").val('');

            $("#blueprints-table tbody").empty();

            blueprints.map(function (bp) {
                $("#blueprints-table tbody").append(
                    `<tr>
                        <td class="body-text-wrapper">${bp.name}</td>
                        <td class="body-text-wrapper">${bp.points}</td>
                        <td class="body-text-wrapper">
                            <button class="btn btn-secondary" onclick="app.drawBlueprint('${author}', '${bp.name}')">Select</button>
                        </td>
                     </tr>`
                )
            })

            let totalPoints = blueprints.reduce(function (acc, bp) {
                return acc + bp.points;
            }, 0);

            $("#authorName").text(`${author}'s Blueprints: `);
            $("#totalPoints").text(`Total user points: ${totalPoints}`);
        });
    }

    function drawBlueprint(authorName, blueprintName) {
        api.getBlueprintsByNameAndAuthor(authorName, blueprintName, function (blueprint) {
            if (!blueprint) {
                alert("Blueprint not found");
                return;
            }

            $("#currentBlueprintName").text("Current blueprint: " + blueprint.name);

            setCurrentBlueprint(blueprint);
        });
    }

    function initCanvasEvents() {
        const canvas = document.getElementById("blueprintCanvas");
        canvas.addEventListener("pointerdown", function (event) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            if (event.button === 2) {
                removeNearestPoint(x, y);
            } else {
                addPointToCurrentBlueprint(x, y);
            }
        });
    }

    function repaintBlueprint() {
        if (!currentBlueprint) return;
        const canvas = document.getElementById("blueprintCanvas");
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const points = currentBlueprint.points;
        if (points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = "red";
            for (let p of points) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }

    function setCurrentBlueprint(blueprint) {
        currentBlueprint = blueprint;
        repaintBlueprint();
    }

    function addPointToCurrentBlueprint(x, y) {
        if (!currentBlueprint) {
            console.log("No blueprint selected.");
            return;
        }
        currentBlueprint.points.push({ x, y });
        console.log("Total points:", currentBlueprint.points.length);
        console.log("Puntos actuales:", currentBlueprint.points);
        repaintBlueprint();
    }

    function removeNearestPoint(x, y) {
        if (!currentBlueprint || currentBlueprint.points.length === 0) return;

        let closestIndex = -1;
        let minDistance = Infinity;

        for (const [index, point] of currentBlueprint.points.entries()) {
            const distance = Math.hypot(point.x - x, point.y - y);
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = index;
            }
        }

        const threshold = 10;
        if (minDistance < threshold) {
            currentBlueprint.points.splice(closestIndex, 1);
            repaintBlueprint();
        }
    }

    function uploadBlueprint() {
        const name = document.getElementById("newName").value.trim();

        if (!author || !name) {
            alert("Author and name are required.");
            return;
        }

        const blueprint = {
            author: author,
            name: name,
            points: []
        };

        $.ajax({
            url: "http://localhost:8080/blueprints",
            type: "POST",
            data: JSON.stringify(blueprint),
            contentType: "application/json"
        }).then(() => {
            app.updateBlueprints(author);
            app.drawBlueprint(author, name);
            $("#newBlueprintModal").hide();
        }).catch((error) => {
            console.error("Error creating blueprint:", error);
        });
    }

    function saveOrUpdateBlueprint() {
        if (!currentBlueprint || !author) {
            alert("No blueprint selected.");
            return;
        }

        const blueprintData = {
            author: author,
            name: currentBlueprint.name,
            points: currentBlueprint.points
        };

        $.ajax({
            url: `http://localhost:8080/blueprints/${author}/${currentBlueprint.name}`,
            type: 'PUT',
            data: JSON.stringify(blueprintData),
            contentType: "application/json"
        }).then(() => {
            return $.get(`http://localhost:8080/blueprints/${author}`);
        }).then((data) => {
            blueprints = data.map(bp => ({
                name: bp.name,
                points: bp.points.length
            }));

            updateBlueprintTable();
            alert("Blueprint updated and list refreshed!");
        }).catch(() => {
            alert("Error saving or updating blueprint.");
        });
    }

    function updateBlueprintTable() {
        $("#blueprints-table tbody").empty();

        for (const bp of blueprints) {
            $("#blueprints-table tbody").append(
                `<tr>
                    <td class="body-text-wrapper">${bp.name}</td>
                    <td class="body-text-wrapper">${bp.points}</td>
                    <td class="body-text-wrapper">
                        <button class="btn btn-secondary" onclick="app.drawBlueprint('${author}', '${bp.name}')">Select</button>
                    </td>
                 </tr>`
            );
        };

        const totalPoints = blueprints.reduce((acc, bp) => acc + bp.points, 0);
        $("#totalPoints").text(`Total user points: ${totalPoints}`);
    }

    function deleteBlueprint() {
        if (!currentBlueprint || !author) {
            alert("No blueprint is currently selected.");
            return;
        }

        const blueprintName = currentBlueprint.name;
        const confirmed = confirm(`Are you sure you want to delete "${blueprintName}"?`);

        if (!confirmed) return;

        $.ajax({
            url: `http://localhost:8080/blueprints/${author}/${blueprintName}`,
            type: 'DELETE'
        }).then(() => {
            currentBlueprint = null;
            $("#currentBlueprintName").text("Current blueprint: None");
            drawDefaultImage();

            return $.get(`http://localhost:8080/blueprints/${author}`);
        }).then((data) => {
            blueprints = data.map(bp => ({
                name: bp.name,
                points: bp.points.length
            }));

            updateBlueprintTable();
            alert(`Blueprint "${blueprintName}" deleted successfully.`);
        }).catch(() => {
            alert("Error deleting blueprint.");
        });
    }

    return {
        uploadBlueprint: uploadBlueprint,
        updateBlueprints: updateBlueprints,
        deleteBlueprint: deleteBlueprint,
        drawDefaultImage: drawDefaultImage,
        drawBlueprint: drawBlueprint,
        initCanvasEvents: initCanvasEvents,
        setCurrentBlueprint: setCurrentBlueprint,
        repaintBlueprint : repaintBlueprint,
        saveOrUpdateBlueprint: saveOrUpdateBlueprint,
        resizeCanvas: resizeCanvas
    };
})();