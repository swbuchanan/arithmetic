const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const WIDTH = 640;
const HEIGHT = 240;
const PADDING = { top: 18, right: 20, bottom: 34, left: 46 };
function createSvgElement(name, attributes) {
    const element = document.createElementNS(SVG_NAMESPACE, name);
    for (const attribute in attributes) {
        if (Object.prototype.hasOwnProperty.call(attributes, attribute)) {
            element.setAttribute(attribute, attributes[attribute]);
        }
    }
    return element;
}
function formatCompletedAt(completedAt) {
    const date = new Date(completedAt);
    if (Number.isNaN(date.getTime()))
        return completedAt;
    return date.toLocaleString();
}
export function renderHistoryGraph(graph, emptyMessage, attempts) {
    graph.replaceChildren();
    const orderedAttempts = [...attempts].sort((left, right) => new Date(left.completedAt).getTime() - new Date(right.completedAt).getTime());
    if (orderedAttempts.length === 0) {
        graph.setAttribute("hidden", "");
        emptyMessage.hidden = false;
        graph.setAttribute("aria-label", "No completed attempts for these settings.");
        return;
    }
    graph.removeAttribute("hidden");
    emptyMessage.hidden = true;
    const plotLeft = PADDING.left;
    const plotRight = WIDTH - PADDING.right;
    const plotTop = PADDING.top;
    const plotBottom = HEIGHT - PADDING.bottom;
    const plotWidth = plotRight - plotLeft;
    const plotHeight = plotBottom - plotTop;
    const maximumScore = Math.max(1, ...orderedAttempts.map(attempt => attempt.score));
    const horizontalAxis = createSvgElement("line", {
        x1: String(plotLeft),
        y1: String(plotBottom),
        x2: String(plotRight),
        y2: String(plotBottom),
        class: "history-axis"
    });
    const verticalAxis = createSvgElement("line", {
        x1: String(plotLeft),
        y1: String(plotTop),
        x2: String(plotLeft),
        y2: String(plotBottom),
        class: "history-axis"
    });
    graph.append(horizontalAxis, verticalAxis);
    const zeroLabel = createSvgElement("text", {
        x: String(plotLeft - 8),
        y: String(plotBottom + 5),
        class: "history-axis-label",
        "text-anchor": "end"
    });
    zeroLabel.textContent = "0";
    const maximumLabel = createSvgElement("text", {
        x: String(plotLeft - 8),
        y: String(plotTop + 5),
        class: "history-axis-label",
        "text-anchor": "end"
    });
    maximumLabel.textContent = String(maximumScore);
    const attemptLabel = createSvgElement("text", {
        x: String((plotLeft + plotRight) / 2),
        y: String(HEIGHT - 7),
        class: "history-axis-label",
        "text-anchor": "middle"
    });
    attemptLabel.textContent = orderedAttempts.length === 1 ? "Attempt 1" : `Attempts 1–${orderedAttempts.length}`;
    graph.append(zeroLabel, maximumLabel, attemptLabel);
    const points = orderedAttempts.map((attempt, index) => {
        const x = orderedAttempts.length === 1
            ? plotLeft + plotWidth / 2
            : plotLeft + (index / (orderedAttempts.length - 1)) * plotWidth;
        const y = plotBottom - (attempt.score / maximumScore) * plotHeight;
        return { attempt, index, x, y };
    });
    const line = createSvgElement("polyline", {
        points: points.map(point => `${point.x},${point.y}`).join(" "),
        class: "history-line"
    });
    graph.append(line);
    for (const point of points) {
        const description = `Attempt ${point.index + 1}: ${point.attempt.score} on ${formatCompletedAt(point.attempt.completedAt)}`;
        const circle = createSvgElement("circle", {
            cx: String(point.x),
            cy: String(point.y),
            r: "5",
            class: "history-point",
            tabindex: "0",
            role: "img",
            "aria-label": description
        });
        const title = createSvgElement("title", {});
        title.textContent = description;
        circle.append(title);
        graph.append(circle);
    }
    graph.setAttribute("aria-label", `Score history for ${orderedAttempts.length} completed ${orderedAttempts.length === 1 ? "attempt" : "attempts"}.`);
}
