const stateType = [
    {
        short: "RULE",
        long: "Rule call\nThis is not a real ATN state but a placeholder to indicate a sub rule being 'called' by " +
            "the rule transition.",
    },
    { short: "BASIC", long: "Basic state" },
    { short: "START", long: "Rule start\nThe entry node of a rule." },
    { short: "BSTART", long: "Block start state\nThe start of a regular (...) block." },
    { short: "PBSTART", long: "Plus block start state\nStart of the actual block in a (A|b|...)+ loop." },
    { short: "SBSTART", long: "Star block start\nStart of the actual block in a (A|b|...)* loop." },
    { short: "TSTART", long: "Token start\nThe entry state of a rule." },
    { short: "STOP", long: "Rule stop\nThe exit state of a rule." },
    { short: "BEND", long: "Block end\nTerminal node of a simple (A|b|...) block." },
    { short: "SLBACK", long: "Star loop back\nThe loop back state from the inner block to the star loop entry state." },
    { short: "SLENTRY", long: "Star loop entry\nEntry + exit state for (A|B|...)* loops." },
    {
        short: "PLBACK",
        long: "Plus loop back\nThe loop back state from the inner block to the plus block start state.",
    },
    { short: "LEND", long: "Loop end\nMarks the end of a * or + loop." },
];
var ATNStateType;
(function (ATNStateType) {
    ATNStateType[ATNStateType["INVALID_TYPE"] = 0] = "INVALID_TYPE";
    ATNStateType[ATNStateType["BASIC"] = 1] = "BASIC";
    ATNStateType[ATNStateType["RULE_START"] = 2] = "RULE_START";
    ATNStateType[ATNStateType["BLOCK_START"] = 3] = "BLOCK_START";
    ATNStateType[ATNStateType["PLUS_BLOCK_START"] = 4] = "PLUS_BLOCK_START";
    ATNStateType[ATNStateType["STAR_BLOCK_START"] = 5] = "STAR_BLOCK_START";
    ATNStateType[ATNStateType["TOKEN_START"] = 6] = "TOKEN_START";
    ATNStateType[ATNStateType["RULE_STOP"] = 7] = "RULE_STOP";
    ATNStateType[ATNStateType["BLOCK_END"] = 8] = "BLOCK_END";
    ATNStateType[ATNStateType["STAR_LOOP_BACK"] = 9] = "STAR_LOOP_BACK";
    ATNStateType[ATNStateType["STAR_LOOP_ENTRY"] = 10] = "STAR_LOOP_ENTRY";
    ATNStateType[ATNStateType["PLUS_LOOP_BACK"] = 11] = "PLUS_LOOP_BACK";
    ATNStateType[ATNStateType["LOOP_END"] = 12] = "LOOP_END";
})(ATNStateType || (ATNStateType = {}));
const ATNRuleType = ATNStateType.INVALID_TYPE;
class ATNGraphRenderer {
    vscode;
    static gridSize = 20;
    svg;
    topGroup;
    zoom;
    figures;
    lines;
    textSelection;
    descriptions;
    linkLabels;
    simulation;
    uri;
    ruleName;
    currentNodes;
    maxLabelCount;
    constructor(vscode) {
        this.vscode = vscode;
        this.svg = d3.select("svg")
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .attr("version", "1.1")
            .attr("width", "100%");
        this.zoom = d3.zoom()
            .scaleExtent([0.15, 3])
            .on("zoom", (e) => {
            this.topGroup.attr("transform", e.transform.toString());
        });
        window.addEventListener("message", (event) => {
            if (event.data.command === "updateATNTreeData") {
                this.render(event.data.graphData);
            }
        });
    }
    get currentTransformation() {
        return d3.zoomTransform(this.topGroup.node());
    }
    render(data) {
        if (this.currentNodes) {
            const args = {
                command: "saveATNState",
                nodes: this.currentNodes,
                uri: this.uri,
                rule: this.ruleName,
                transform: d3.zoomTransform(this.topGroup.node()),
            };
            this.vscode.postMessage(args);
        }
        this.currentNodes = undefined;
        if (!data.ruleName) {
            const label = document.createElement("label");
            label.classList.add("noSelection");
            label.innerText = "No rule selected";
            if (this.topGroup) {
                this.topGroup.remove();
            }
            document.body.appendChild(label);
            this.svg.style("display", "none");
            return;
        }
        if (!data.graphData) {
            const label = document.createElement("label");
            label.classList.add("noData");
            label.innerText = "No ATN data found (code generation must run at least once in internal or external mode)";
            if (this.topGroup) {
                this.topGroup.remove();
            }
            document.body.appendChild(label);
            this.svg.style("display", "none");
            return;
        }
        let labels = document.body.getElementsByClassName("noData");
        while (labels.length > 0) {
            labels.item(0)?.remove();
        }
        labels = document.body.getElementsByClassName("noSelection");
        while (labels.length > 0) {
            labels.item(0)?.remove();
        }
        this.svg.style("display", "block");
        this.uri = data.uri;
        this.ruleName = data.ruleName;
        this.maxLabelCount = data.maxLabelCount;
        this.currentNodes = data.graphData.nodes;
        const links = data.graphData.links;
        this.topGroup = this.svg.select(".topGroup");
        this.topGroup.remove();
        this.topGroup = this.svg.append("g").classed("topGroup", true);
        const xTranslate = data.initialTranslation.x ?? (this.svg.node()?.clientWidth ?? 0) / 2;
        const yTranslate = data.initialTranslation.y ?? (this.svg.node()?.clientHeight ?? 0) / 2;
        this.svg.call(this.zoom)
            .call(this.zoom.transform, d3.zoomIdentity
            .scale(data.initialScale ?? 0.5)
            .translate(xTranslate, yTranslate))
            .on("dblclick.zoom", null);
        const linesHost = this.topGroup.append("g").classed("linesHost", true);
        this.lines = linesHost.selectAll("line")
            .data(links)
            .enter().append("line")
            .attr("class", "transition")
            .attr("marker-end", (link) => {
            if (this.currentNodes[link.target].type === ATNRuleType) {
                return "url(#transitionEndRect)";
            }
            return "url(#transitionEndCircle)";
        });
        const statesHost = this.topGroup.append("g").classed("statesHost", true);
        const stateElements = statesHost.selectAll().data(this.currentNodes);
        stateElements.enter().append((node) => {
            let s;
            let element;
            let cssClass = "state " + stateType[node.type].short;
            const recursive = node.name === data.ruleName;
            if (recursive) {
                cssClass += " recursive";
            }
            if (node.type === ATNRuleType) {
                element = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                s = d3.select(element)
                    .attr("width", 50)
                    .attr("height", 50)
                    .attr("y", -25)
                    .attr("rx", 5)
                    .attr("ry", recursive ? 20 : 5)
                    .attr("class", cssClass)
                    .on("dblclick", this.doubleClicked)
                    .call(d3.drag()
                    .on("start", this.dragStarted)
                    .on("drag", this.dragged));
            }
            else {
                element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                s = d3.select(element)
                    .attr("r", 30)
                    .attr("class", cssClass)
                    .on("dblclick", this.doubleClicked)
                    .call(d3.drag()
                    .on("start", this.dragStarted)
                    .on("drag", this.dragged));
            }
            s.append("title").text(stateType[node.type].long);
            return element;
        });
        this.figures = statesHost.selectAll(".state").data(this.currentNodes);
        const textHost = this.topGroup.append("g").classed("textHost", true);
        this.textSelection = textHost.selectAll("text")
            .data(this.currentNodes)
            .enter().append("text")
            .attr("x", 0)
            .attr("y", 0)
            .attr("class", "stateLabel")
            .text((d) => {
            return d.name;
        });
        const textNodes = this.textSelection.nodes();
        const rectNodes = this.figures.nodes();
        const border = 20;
        for (let i = 0; i < textNodes.length; ++i) {
            if (this.currentNodes[i].type === ATNRuleType) {
                const element = textNodes[i];
                let width = Math.ceil(element.getComputedTextLength());
                if (width < 70) {
                    width = 70;
                }
                width += border;
                const rect = rectNodes[i];
                rect.setAttribute("width", `${width}px`);
                rect.setAttribute("x", `${-width / 2}px`);
                this.currentNodes[i].width = width;
            }
        }
        const descriptionHost = this.topGroup.append("g").classed("descriptionHost", true);
        this.descriptions = descriptionHost.selectAll("description")
            .data(this.currentNodes)
            .enter().append("text")
            .attr("x", 0)
            .attr("y", 13)
            .attr("class", "stateTypeLabel")
            .text((node) => {
            return stateType[node.type].short;
        });
        const labelsHost = this.topGroup.append("g").classed("labelsHost", true);
        this.linkLabels = labelsHost.selectAll("labels")
            .data(links)
            .enter().append("text")
            .attr("x", 0)
            .attr("y", 0)
            .attr("class", "linkLabel")
            .call(this.appendLinkText);
        this.simulation = d3.forceSimulation(this.currentNodes)
            .force("charge", d3.forceManyBody().strength(-400))
            .force("collide", d3.forceCollide(100).strength(0.5).iterations(3))
            .force("link", d3.forceLink(links)
            .distance(200)
            .strength(2))
            .on("tick", this.animationTick)
            .on("end", this.animationEnd);
        this.simulation.stop();
        this.simulation.tick(100);
        this.animationTick();
    }
    resetTransformation = (x, y, scale) => {
        const xTranslate = x ?? (this.svg.node()?.clientWidth ?? 0) / 2;
        const yTranslate = y ?? (this.svg.node()?.clientHeight ?? 0) / 2;
        this.svg.call(this.zoom)
            .call(this.zoom.transform, d3.zoomIdentity
            .scale(scale ?? 0.5)
            .translate(xTranslate, yTranslate));
        this.resetNodePositions();
    };
    resetNodePositions() {
        for (const node of this.currentNodes) {
            node.fx = null;
            node.fy = null;
            if (node.type === ATNStateType.RULE_START) {
                if (node.x === undefined) {
                    node.x = -1000;
                }
                if (!node.fy) {
                    node.fy = 0;
                }
            }
            else if (node.type === ATNStateType.RULE_STOP) {
                if (!node.fy) {
                    node.fy = 0;
                }
            }
        }
    }
    appendLinkText = (links) => {
        links.each((link, index, list) => {
            let lineNumber = 0;
            const element = d3.select(list[index]);
            for (const label of link.labels) {
                ++lineNumber;
                const span = element.append("tspan")
                    .attr("x", 0)
                    .attr("dy", "1.5em")
                    .text(label.content);
                if (label.class) {
                    span.classed(label.class, true);
                }
                if (lineNumber === this.maxLabelCount) {
                    const remainingCount = link.labels.length - this.maxLabelCount;
                    if (remainingCount > 0) {
                        element.append("tspan")
                            .attr("x", 0)
                            .attr("dy", "1.5em")
                            .text(`${link.labels.length - this.maxLabelCount} more ...`);
                    }
                    break;
                }
            }
        });
    };
    animationTick = () => {
        this.figures.attr("transform", this.transform);
        this.textSelection.attr("transform", this.transform);
        this.descriptions.attr("transform", this.transform);
        this.transformLines();
        this.transformLinkLabels();
    };
    animationEnd = () => {
        this.figures.attr("transform", this.snapTransform);
        this.textSelection.attr("transform", this.snapTransform);
        this.descriptions.attr("transform", this.snapTransform);
        this.transformLines();
        this.transformLinkLabels();
    };
    transform = (node) => {
        return `translate(${node.x ?? 0},${node.y ?? 0})`;
    };
    snapTransform = (node) => {
        return `translate(${this.snapToGrid(node.x ?? 0)},${this.snapToGrid(node.y ?? 0)})`;
    };
    endCoordinate(horizontal, element) {
        if (this.isATNLayoutNode(element.source) && this.isATNLayoutNode(element.target)) {
            if (element.target.type === ATNRuleType) {
                const sourceX = element.source.x ?? 0;
                const sourceY = element.source.y ?? 0;
                const targetX = element.target.x ?? 0;
                const targetY = element.target.y ?? 0;
                const targetWidth = element.target.width ?? 0;
                const line1 = {
                    x1: sourceX,
                    y1: sourceY,
                    x2: targetX,
                    y2: targetY,
                };
                let line2 = {
                    x1: targetX - targetWidth / 2,
                    y1: targetY - 25,
                    x2: targetX + targetWidth / 2,
                    y2: targetY - 25,
                };
                let intersection = this.lineIntersection(line1, line2);
                if (intersection) {
                    return horizontal ? intersection.x : intersection.y;
                }
                line2 = {
                    x1: targetX - targetWidth / 2,
                    y1: targetY + 25,
                    x2: targetX + targetWidth / 2,
                    y2: targetY + 25,
                };
                intersection = this.lineIntersection(line1, line2);
                if (intersection) {
                    return horizontal ? intersection.x : intersection.y;
                }
                line2 = {
                    x1: targetX - targetWidth / 2,
                    y1: targetY - 25,
                    x2: targetX - targetWidth / 2,
                    y2: targetY + 25,
                };
                intersection = this.lineIntersection(line1, line2);
                if (intersection) {
                    return horizontal ? intersection.x : intersection.y;
                }
                line2 = {
                    x1: targetX + targetWidth / 2,
                    y1: targetY - 25,
                    x2: targetX + targetWidth / 2,
                    y2: targetY + 25,
                };
                intersection = this.lineIntersection(line1, line2);
                if (intersection) {
                    return horizontal ? intersection.x : intersection.y;
                }
            }
            return (horizontal ? element.target.x : element.target.y) ?? 0;
        }
        return 0;
    }
    lineIntersection(line1, line2) {
        const s1X = line1.x2 - line1.x1;
        const s1Y = line1.y2 - line1.y1;
        const s2X = line2.x2 - line2.x1;
        const s2Y = line2.y2 - line2.y1;
        const s = (-s1Y * (line1.x1 - line2.x1) + s1X * (line1.y1 - line2.y1)) / (-s2X * s1Y + s1X * s2Y);
        const t = (s2X * (line1.y1 - line2.y1) - s2Y * (line1.x1 - line2.x1)) / (-s2X * s1Y + s1X * s2Y);
        if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
            return {
                x: line1.x1 + (t * s1X),
                y: line1.y1 + (t * s1Y),
            };
        }
        return undefined;
    }
    transformLinkLabels() {
        this.linkLabels
            .attr("transform", (link) => {
            const targetY = this.isSimulationNodeDatum(link.target) ? link.target.y ?? 0 : 0;
            const sourceY = this.isSimulationNodeDatum(link.source) ? link.source.y ?? 0 : 0;
            let sourceX = 0;
            if (this.isSimulationNodeDatum(link.source)) {
                sourceX = link.source.x ?? 0;
            }
            let targetX = 0;
            if (this.isSimulationNodeDatum(link.target)) {
                targetX = link.target.x ?? 0;
            }
            const slope = Math.atan2((targetY - sourceY), (targetX - sourceX)) * 180 / Math.PI;
            if (this.isSimulationNodeDatum(link.source)) {
                if (link.source.width) {
                    sourceX += link.source.width / 2;
                }
                else {
                    sourceX += 25;
                }
            }
            if (this.isSimulationNodeDatum(link.target)) {
                if (link.target.width) {
                    targetX -= link.target.width / 2;
                }
                else {
                    targetX -= 25;
                }
            }
            let xOffset = 0;
            let yOffset = 0;
            let effectiveSlope = 0;
            switch (true) {
                case (slope > -45 && slope < 45): {
                    effectiveSlope = slope;
                    break;
                }
                case (slope < -135 || slope > 135): {
                    effectiveSlope = slope + 180;
                    xOffset = 10;
                    break;
                }
                case (slope >= 45 || slope <= -45): {
                    xOffset = 10;
                    yOffset = -10;
                    break;
                }
                default:
            }
            return `translate(${(targetX + sourceX) / 2}, ${(targetY + sourceY) / 2}) rotate(${effectiveSlope}) ` +
                `translate(${xOffset}, ${yOffset})`;
        });
    }
    transformLines() {
        this.lines
            .attr("x1", (link) => {
            if (this.isATNLayoutNode(link.source)) {
                return link.source.x ?? 0;
            }
            return 0;
        })
            .attr("y1", (link) => {
            if (this.isATNLayoutNode(link.source)) {
                return link.source.y ?? 0;
            }
            return 0;
        })
            .attr("x2", (link) => {
            if (this.isATNLayoutNode(link.target)) {
                link.target.endX = this.endCoordinate(true, link);
                return link.target.endX;
            }
            return 0;
        })
            .attr("y2", (link) => {
            if (this.isATNLayoutNode(link.target)) {
                link.target.endY = this.endCoordinate(false, link);
                return link.target.endY;
            }
            return 0;
        });
    }
    dragStarted = (e) => {
        if (!e.active) {
            this.simulation.alphaTarget(0.3).restart();
        }
        e.subject.fx = e.x;
        e.subject.fy = e.y;
    };
    dragged = (e) => {
        e.subject.fx = this.snapToGrid(e.x);
        e.subject.fy = this.snapToGrid(e.y);
    };
    doubleClicked = (_event, data) => {
        const node = data;
        node.fx = undefined;
        node.fy = undefined;
    };
    snapToGrid(value) {
        return Math.round(value / ATNGraphRenderer.gridSize) * ATNGraphRenderer.gridSize;
    }
    isATNLayoutNode(node) {
        return (typeof node !== "string") && (typeof node !== "number");
    }
    isSimulationNodeDatum(node) {
        return (typeof node !== "string") && (typeof node !== "number");
    }
}
export { ATNGraphRenderer };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQVROR3JhcGhSZW5kZXJlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy93ZWJ2aWV3LXNjcmlwdHMvQVROR3JhcGhSZW5kZXJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFhQSxNQUFNLFNBQVMsR0FBRztJQUNkO1FBQ0ksS0FBSyxFQUFFLE1BQU07UUFDYixJQUFJLEVBQUUscUdBQXFHO1lBQ3ZHLHNCQUFzQjtLQUM3QjtJQUNELEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsYUFBYSxFQUFFO0lBQ3ZDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsdUNBQXVDLEVBQUU7SUFDakUsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSx3REFBd0QsRUFBRTtJQUNuRixFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLHlFQUF5RSxFQUFFO0lBQ3JHLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsbUVBQW1FLEVBQUU7SUFDL0YsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSx5Q0FBeUMsRUFBRTtJQUNwRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLHNDQUFzQyxFQUFFO0lBQy9ELEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsdURBQXVELEVBQUU7SUFDaEYsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSx3RkFBd0YsRUFBRTtJQUNuSCxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLDJEQUEyRCxFQUFFO0lBQ3ZGO1FBQ0ksS0FBSyxFQUFFLFFBQVE7UUFDZixJQUFJLEVBQUUseUZBQXlGO0tBQ2xHO0lBQ0QsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSwyQ0FBMkMsRUFBRTtDQUN2RSxDQUFDO0FBT0YsSUFBSyxZQWNKO0FBZEQsV0FBSyxZ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Q0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3hDLENBQUMsQ0FBQztJQUVNLGFBQWEsR0FBRyxDQUFDLE1BQWtCLEVBQUUsSUFBYSxFQUFFLEVBQUU7UUFDMUQsTUFBTSxJQUFJLEdBQUcsSUFBMkIsQ0FBQztRQUN6QyxJQUFJLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQztRQUNwQixJQUFJLENBQUMsRUFBRSxHQUFHLFNBQVMsQ0FBQztJQUN4QixDQUFDLENBQUM7SUFFTSxVQUFVLENBQUMsS0FBYTtRQUM1QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxHQUFHLGdCQUFnQixDQUFDLFFBQVEsQ0FBQztJQUNyRixDQUFDO0lBRU8sZUFBZSxDQUFDLElBQTJDO1FBQy9ELE9BQU8sQ0FBQyxPQUFPLElBQUksS0FBSyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFTyxxQkFBcUIsQ0FBQyxJQUE4QztRQUN4RSxPQUFPLENBQUMsT0FBTyxJQUFJLEtBQUssUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLElBQUksS0FBSyxRQUFRLENBQUMsQ0FBQztJQUNwRSxDQUFDOztTQWhtQlEsZ0JBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiLypcclxuICogQ29weXJpZ2h0IChjKSBNaWtlIExpc2Noa2UuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS4gU2VlIExpY2Vuc2UudHh0IGluIHRoZSBwcm9qZWN0IHJvb3QgZm9yIGxpY2Vuc2UgaW5mb3JtYXRpb24uXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgRDNEcmFnRXZlbnQsIFNpbXVsYXRpb25MaW5rRGF0dW0sIFNpbXVsYXRpb25Ob2RlRGF0dW0gfSBmcm9tIFwiZDNcIjtcclxuaW1wb3J0IHsgVXJpIH0gZnJvbSBcInZzY29kZVwiO1xyXG5cclxuaW1wb3J0IHtcclxuICAgIElBVE5HcmFwaERhdGEsIElBVE5Ob2RlLCBJQVROR3JhcGhMYXlvdXROb2RlLCBJQVROTGluaywgSUFUTkdyYXBoTGF5b3V0TGluaywgSUFUTkdyYXBoUmVuZGVyZXJEYXRhLCBJVlNDb2RlLFxyXG4gICAgSUFUTkdyYXBoVXBkYXRlTWVzc2FnZURhdGEsIElBVE5TdGF0ZVNhdmVNZXNzYWdlLFxyXG59IGZyb20gXCIuL3R5cGVzXCI7XHJcblxyXG5jb25zdCBzdGF0ZVR5cGUgPSBbXHJcbiAgICB7ICAvLyBQcmV0ZW5kIHRoYXQgdGhpcyBzdGF0ZSB0eXBlIGlzIGEgcnVsZS4gSXQncyBub3JtYWxseSB0aGUgSU5WQUxJRCBzdGF0ZSB0eXBlLlxyXG4gICAgICAgIHNob3J0OiBcIlJVTEVcIixcclxuICAgICAgICBsb25nOiBcIlJ1bGUgY2FsbFxcblRoaXMgaXMgbm90IGEgcmVhbCBBVE4gc3RhdGUgYnV0IGEgcGxhY2Vob2xkZXIgdG8gaW5kaWNhdGUgYSBzdWIgcnVsZSBiZWluZyAnY2FsbGVkJyBieSBcIiArXHJcbiAgICAgICAgICAgIFwidGhlIHJ1bGUgdHJhbnNpdGlvbi5cIixcclxuICAgIH0sXHJcbiAgICB7IHNob3J0OiBcIkJBU0lDXCIsIGxvbmc6IFwiQmFzaWMgc3RhdGVcIiB9LFxyXG4gICAgeyBzaG9ydDogXCJTVEFSVFwiLCBsb25nOiBcIlJ1bGUgc3RhcnRcXG5UaGUgZW50cnkgbm9kZSBvZiBhIHJ1bGUuXCIgfSxcclxuICAgIHsgc2hvcnQ6IFwiQlNUQVJUXCIsIGxvbmc6IFwiQmxvY2sgc3RhcnQgc3RhdGVcXG5UaGUgc3RhcnQgb2YgYSByZWd1bGFyICguLi4pIGJsb2NrLlwiIH0sXHJcbiAgICB7IHNob3J0OiBcIlBCU1RBUlRcIiwgbG9uZzogXCJQbHVzIGJsb2NrIHN0YXJ0IHN0YXRlXFxuU3RhcnQgb2YgdGhlIGFjdHVhbCBibG9jayBpbiBhIChBfGJ8Li4uKSsgbG9vcC5cIiB9LFxyXG4gICAgeyBzaG9ydDogXCJTQlNUQVJUXCIsIGxvbmc6IFwiU3RhciBibG9jayBzdGFydFxcblN0YXJ0IG9mIHRoZSBhY3R1YWwgYmxvY2sgaW4gYSAoQXxifC4uLikqIGxvb3AuXCIgfSxcclxuICAgIHsgc2hvcnQ6IFwiVFNUQVJUXCIsIGxvbmc6IFwiVG9rZW4gc3RhcnRcXG5UaGUgZW50cnkgc3RhdGUgb2YgYSBydWxlLlwiIH0sXHJcbiAgICB7IHNob3J0OiBcIlNUT1BcIiwgbG9uZzogXCJSdWxlIHN0b3BcXG5UaGUgZXhpdCBzdGF0ZSBvZiBhIHJ1bGUuXCIgfSxcclxuICAgIHsgc2hvcnQ6IFwiQkVORFwiLCBsb25nOiBcIkJsb2NrIGVuZFxcblRlcm1pbmFsIG5vZGUgb2YgYSBzaW1wbGUgKEF8YnwuLi4pIGJsb2NrLlwiIH0sXHJcbiAgICB7IHNob3J0OiBcIlNMQkFDS1wiLCBsb25nOiBcIlN0YXIgbG9vcCBiYWNrXFxuVGhlIGxvb3AgYmFjayBzdGF0ZSBmcm9tIHRoZSBpbm5lciBibG9jayB0byB0aGUgc3RhciBsb29wIGVudHJ5IHN0YXRlLlwiIH0sXHJcbiAgICB7IHNob3J0OiBcIlNMRU5UUllcIiwgbG9uZzogXCJTdGFyIGxvb3AgZW50cnlcXG5FbnRyeSArIGV4aXQgc3RhdGUgZm9yIChBfEJ8Li4uKSogbG9vcHMuXCIgfSxcclxuICAgIHtcclxuICAgICAgICBzaG9ydDogXCJQTEJBQ0tcIixcclxuICAgICAgICBsb25nOiBcIlBsdXMgbG9vcCBiYWNrXFxuVGhlIGxvb3AgYmFjayBzdGF0ZSBmcm9tIHRoZSBpbm5lciBibG9jayB0byB0aGUgcGx1cyBibG9jayBzdGFydCBzdGF0ZS5cIixcclxuICAgIH0sXHJcbiAgICB7IHNob3J0OiBcIkxFTkRcIiwgbG9uZzogXCJMb29wIGVuZFxcbk1hcmtzIHRoZSBlbmQgb2YgYSAqIG9yICsgbG9vcC5cIiB9LFxyXG5dO1xyXG5cclxuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uICovXHJcblxyXG4vLyBUaGlzIGVudW0gaXMgYSBjb3B5IG9mIHRoZSBkZWNsYXJhdGlvbiBpbiBhbnRscjR0cy4gSXQncyBoZXJlIHRvIGF2b2lkIGhhdmluZyB0byBpbXBvcnQgaXQuXHJcbi8vIFB1cmUgdHlwZXMgZGlzYXBwZWFyIHdoZW4gdGhpcyBmaWxlIGlzIHRyYW5zcGlsZWQgdG8gSlMuIE5vdCB0aGlzIHR5cGUgdGhvdWdoIChlbnVtcyBiZWNvbWUgdmFycyBhbmQgaW1wb3J0aW5nXHJcbi8vIHRoZW0gcmVzdWx0cyBpbiBhIHdyb25nIGltcG9ydCBzdGF0ZW1lbnQgaW4gdGhlIHRyYW5zcGlsZWQgZmlsZSkuXHJcbmVudW0gQVROU3RhdGVUeXBlIHtcclxuICAgIElOVkFMSURfVFlQRSA9IDAsXHJcbiAgICBCQVNJQyA9IDEsXHJcbiAgICBSVUxFX1NUQVJUID0gMixcclxuICAgIEJMT0NLX1NUQVJUID0gMyxcclxuICAgIFBMVVNfQkxPQ0tfU1RBUlQgPSA0LFxyXG4gICAgU1RBUl9CTE9DS19TVEFSVCA9IDUsXHJcbiAgICBUT0tFTl9TVEFSVCA9IDYsXHJcbiAgICBSVUxFX1NUT1AgPSA3LFxyXG4gICAgQkxPQ0tfRU5EID0gOCxcclxuICAgIFNUQVJfTE9PUF9CQUNLID0gOSxcclxuICAgIFNUQVJfTE9PUF9FTlRSWSA9IDEwLFxyXG4gICAgUExVU19MT09QX0JBQ0sgPSAxMSxcclxuICAgIExPT1BfRU5EID0gMTJcclxufVxyXG5cclxuY29uc3QgQVROUnVsZVR5cGUgPSBBVE5TdGF0ZVR5cGUuSU5WQUxJRF9UWVBFO1xyXG5cclxuLyogZXNsaW50LWVuYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb24gKi9cclxuXHJcbmludGVyZmFjZSBJTGluZSB7XHJcbiAgICB4MTogbnVtYmVyO1xyXG4gICAgeTE6IG51bWJlcjtcclxuICAgIHgyOiBudW1iZXI7XHJcbiAgICB5MjogbnVtYmVyO1xyXG59XHJcblxyXG50eXBlIEFUTk5vZGVTZWxlY3Rpb24gPSBkMy5TZWxlY3Rpb248U1ZHRWxlbWVudCwgSUFUTkdyYXBoTGF5b3V0Tm9kZSwgU1ZHRWxlbWVudCwgSUFUTkdyYXBoRGF0YT47XHJcbnR5cGUgQVROTGlua1NlbGVjdGlvbiA9IGQzLlNlbGVjdGlvbjxTVkdMaW5lRWxlbWVudCwgSUFUTkxpbmssIFNWR0VsZW1lbnQsIElBVE5HcmFwaERhdGE+O1xyXG50eXBlIEFUTlRleHRTZWxlY3Rpb24gPSBkMy5TZWxlY3Rpb248U1ZHVGV4dEVsZW1lbnQsIElBVE5Ob2RlLCBTVkdHRWxlbWVudCwgSUFUTkdyYXBoRGF0YT47XHJcbnR5cGUgQVROTGlua1RleHRTZWxlY3Rpb24gPSBkMy5TZWxlY3Rpb248U1ZHVGV4dEVsZW1lbnQsIElBVE5HcmFwaExheW91dExpbmssIFNWR0dFbGVtZW50LCBJQVROR3JhcGhEYXRhPjtcclxuXHJcbnR5cGUgQVROR3JhcGhEcmFnRXZlbnQgPSBEM0RyYWdFdmVudDxTVkdFbGVtZW50LCBJQVROR3JhcGhEYXRhLCBJQVROR3JhcGhMYXlvdXROb2RlPjtcclxuXHJcbmV4cG9ydCBjbGFzcyBBVE5HcmFwaFJlbmRlcmVyIHtcclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyByZWFkb25seSBncmlkU2l6ZSA9IDIwO1xyXG5cclxuICAgIHByaXZhdGUgc3ZnOiBkMy5TZWxlY3Rpb248U1ZHRWxlbWVudCwgSUFUTkdyYXBoRGF0YSwgSFRNTEVsZW1lbnQsIHVua25vd24+O1xyXG4gICAgcHJpdmF0ZSB0b3BHcm91cDogZDMuU2VsZWN0aW9uPFNWR0VsZW1lbnQsIElBVE5HcmFwaERhdGEsIEhUTUxFbGVtZW50LCB1bmtub3duPjtcclxuXHJcbiAgICBwcml2YXRlIHpvb206IGQzLlpvb21CZWhhdmlvcjxTVkdFbGVtZW50LCBJQVROR3JhcGhEYXRhPjtcclxuICAgIHByaXZhdGUgZmlndXJlczogQVROTm9kZVNlbGVjdGlvbjtcclxuICAgIHByaXZhdGUgbGluZXM6IEFUTkxpbmtTZWxlY3Rpb247XHJcbiAgICBwcml2YXRlIHRleHRTZWxlY3Rpb246IEFUTlRleHRTZWxlY3Rpb247XHJcbiAgICBwcml2YXRlIGRlc2NyaXB0aW9uczogQVROVGV4dFNlbGVjdGlvbjtcclxuICAgIHByaXZhdGUgbGlua0xhYmVsczogQVROTGlua1RleHRTZWxlY3Rpb247XHJcbiAgICBwcml2YXRlIHNpbXVsYXRpb246IGQzLlNpbXVsYXRpb248SUFUTkdyYXBoTGF5b3V0Tm9kZSwgdW5kZWZpbmVkPjtcclxuXHJcbiAgICBwcml2YXRlIHVyaTogVXJpO1xyXG4gICAgcHJpdmF0ZSBydWxlTmFtZTogc3RyaW5nO1xyXG4gICAgcHJpdmF0ZSBjdXJyZW50Tm9kZXM/OiBJQVROR3JhcGhMYXlvdXROb2RlW107XHJcbiAgICBwcml2YXRlIG1heExhYmVsQ291bnQ6IG51bWJlcjtcclxuXHJcbiAgICBwdWJsaWMgY29uc3RydWN0b3IocHJpdmF0ZSB2c2NvZGU6IElWU0NvZGUpIHtcclxuICAgICAgICB0aGlzLnN2ZyA9IGQzLnNlbGVjdDxTVkdFbGVtZW50LCBJQVROR3JhcGhEYXRhPihcInN2Z1wiKVxyXG4gICAgICAgICAgICAuYXR0cihcInhtbG5zXCIsIFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIilcclxuICAgICAgICAgICAgLmF0dHIoXCJ2ZXJzaW9uXCIsIFwiMS4xXCIpXHJcbiAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgXCIxMDAlXCIpOyAvLyBIZWlnaHQgaXMgZGV0ZXJtaW5lZCBieSB0aGUgZmxleCBsYXlvdXQuXHJcblxyXG4gICAgICAgIHRoaXMuem9vbSA9IGQzLnpvb208U1ZHRWxlbWVudCwgSUFUTkdyYXBoRGF0YT4oKVxyXG4gICAgICAgICAgICAuc2NhbGVFeHRlbnQoWzAuMTUsIDNdKVxyXG4gICAgICAgICAgICAub24oXCJ6b29tXCIsIChlOiBkMy5EM1pvb21FdmVudDxTVkdFbGVtZW50LCBJQVROR3JhcGhEYXRhPikgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50b3BHcm91cC5hdHRyKFwidHJhbnNmb3JtXCIsIGUudHJhbnNmb3JtLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gUmVnaXN0ZXIgYSBsaXN0ZW5lciBmb3IgZGF0YSBjaGFuZ2VzLlxyXG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCAoZXZlbnQ6IE1lc3NhZ2VFdmVudDxJQVROR3JhcGhVcGRhdGVNZXNzYWdlRGF0YT4pID0+IHtcclxuICAgICAgICAgICAgaWYgKGV2ZW50LmRhdGEuY29tbWFuZCA9PT0gXCJ1cGRhdGVBVE5UcmVlRGF0YVwiKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcihldmVudC5kYXRhLmdyYXBoRGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoaXMgZ2V0dGVyIGlzIHVzZWQgdG8gcmV0dXJuIHRoZSBjdXJyZW50IHRyYW5zZm9ybWF0aW9uIGRldGFpbHMgZm9yIGNhY2hpbmcuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMgVGhlIGN1cnJlbnQgWm9vbVRyYW5zZm9ybSwgd2l0aCB0aGUgdmFsdWVzIHgsIHksIGFuZCBrIChmb3IgdHJhbnNsYXRpb24gYW5kIHNjYWxpbmcpLlxyXG4gICAgICovXHJcbiAgICBwdWJsaWMgZ2V0IGN1cnJlbnRUcmFuc2Zvcm1hdGlvbigpOiBvYmplY3Qge1xyXG4gICAgICAgIHJldHVybiBkMy56b29tVHJhbnNmb3JtKHRoaXMudG9wR3JvdXAubm9kZSgpISk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlbmRlcihkYXRhOiBJQVROR3JhcGhSZW5kZXJlckRhdGEpOiB2b2lkIHtcclxuICAgICAgICAvLyBTYXZlIHRoZSB0cmFuc2Zvcm1hdGlvbnMgb2YgdGhlIGV4aXN0aW5nIGdyYXBoIChpZiB0aGVyZSdzIG9uZSkuXHJcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudE5vZGVzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGFyZ3M6IElBVE5TdGF0ZVNhdmVNZXNzYWdlID0ge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZDogXCJzYXZlQVROU3RhdGVcIixcclxuICAgICAgICAgICAgICAgIG5vZGVzOiB0aGlzLmN1cnJlbnROb2RlcyxcclxuICAgICAgICAgICAgICAgIHVyaTogdGhpcy51cmksXHJcbiAgICAgICAgICAgICAgICBydWxlOiB0aGlzLnJ1bGVOYW1lLFxyXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtOiBkMy56b29tVHJhbnNmb3JtKHRoaXMudG9wR3JvdXAubm9kZSgpISksXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0aGlzLnZzY29kZS5wb3N0TWVzc2FnZShhcmdzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuY3VycmVudE5vZGVzID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICBpZiAoIWRhdGEucnVsZU5hbWUpIHtcclxuICAgICAgICAgICAgY29uc3QgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIik7XHJcbiAgICAgICAgICAgIGxhYmVsLmNsYXNzTGlzdC5hZGQoXCJub1NlbGVjdGlvblwiKTtcclxuICAgICAgICAgICAgbGFiZWwuaW5uZXJUZXh0ID0gXCJObyBydWxlIHNlbGVjdGVkXCI7XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy50b3BHcm91cCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50b3BHcm91cC5yZW1vdmUoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsYWJlbCk7XHJcbiAgICAgICAgICAgIHRoaXMuc3ZnLnN0eWxlKFwiZGlzcGxheVwiLCBcIm5vbmVcIik7XHJcblxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIWRhdGEuZ3JhcGhEYXRhKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxhYmVsXCIpO1xyXG4gICAgICAgICAgICBsYWJlbC5jbGFzc0xpc3QuYWRkKFwibm9EYXRhXCIpO1xyXG4gICAgICAgICAgICBsYWJlbC5pbm5lclRleHQgPSBcIk5vIEFUTiBkYXRhIGZvdW5kIChjb2RlIGdlbmVyYXRpb24gbXVzdCBydW4gYXQgbGVhc3Qgb25jZSBpbiBpbnRlcm5hbCBvciBleHRlcm5hbCBtb2RlKVwiO1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMudG9wR3JvdXApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudG9wR3JvdXAucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobGFiZWwpO1xyXG4gICAgICAgICAgICB0aGlzLnN2Zy5zdHlsZShcImRpc3BsYXlcIiwgXCJub25lXCIpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgd2UgaGF2ZSBkYXRhLCByZW1vdmUgYW55IHByZXZpb3VzIG1lc3NhZ2Ugd2UgcHJpbnRlZC5cclxuICAgICAgICBsZXQgbGFiZWxzID0gZG9jdW1lbnQuYm9keS5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKFwibm9EYXRhXCIpO1xyXG4gICAgICAgIHdoaWxlIChsYWJlbHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBsYWJlbHMuaXRlbSgwKT8ucmVtb3ZlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsYWJlbHMgPSBkb2N1bWVudC5ib2R5LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJub1NlbGVjdGlvblwiKTtcclxuICAgICAgICB3aGlsZSAobGFiZWxzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgbGFiZWxzLml0ZW0oMCk/LnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5zdmcuc3R5bGUoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIik7XHJcblxyXG4gICAgICAgIHRoaXMudXJpID0gZGF0YS51cmk7XHJcbiAgICAgICAgdGhpcy5ydWxlTmFtZSA9IGRhdGEucnVsZU5hbWU7XHJcblxyXG4gICAgICAgIHRoaXMubWF4TGFiZWxDb3VudCA9IGRhdGEubWF4TGFiZWxDb3VudDtcclxuICAgICAgICB0aGlzLmN1cnJlbnROb2RlcyA9IGRhdGEuZ3JhcGhEYXRhLm5vZGVzIGFzIElBVE5HcmFwaExheW91dE5vZGVbXTtcclxuICAgICAgICBjb25zdCBsaW5rcyA9IGRhdGEuZ3JhcGhEYXRhLmxpbmtzO1xyXG5cclxuICAgICAgICB0aGlzLnRvcEdyb3VwID0gdGhpcy5zdmcuc2VsZWN0KFwiLnRvcEdyb3VwXCIpO1xyXG4gICAgICAgIHRoaXMudG9wR3JvdXAucmVtb3ZlKCk7XHJcbiAgICAgICAgdGhpcy50b3BHcm91cCA9IHRoaXMuc3ZnLmFwcGVuZChcImdcIikuY2xhc3NlZChcInRvcEdyb3VwXCIsIHRydWUpO1xyXG5cclxuICAgICAgICBjb25zdCB4VHJhbnNsYXRlID0gZGF0YS5pbml0aWFsVHJhbnNsYXRpb24ueCA/PyAodGhpcy5zdmcubm9kZSgpPy5jbGllbnRXaWR0aCA/PyAwKSAvIDI7XHJcbiAgICAgICAgY29uc3QgeVRyYW5zbGF0ZSA9IGRhdGEuaW5pdGlhbFRyYW5zbGF0aW9uLnkgPz8gKHRoaXMuc3ZnLm5vZGUoKT8uY2xpZW50SGVpZ2h0ID8/IDApIC8gMjtcclxuICAgICAgICB0aGlzLnN2Zy5jYWxsKHRoaXMuem9vbSlcclxuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC91bmJvdW5kLW1ldGhvZFxyXG4gICAgICAgICAgICAuY2FsbCh0aGlzLnpvb20udHJhbnNmb3JtLCBkMy56b29tSWRlbnRpdHlcclxuICAgICAgICAgICAgICAgIC5zY2FsZShkYXRhLmluaXRpYWxTY2FsZSA/PyAwLjUpXHJcbiAgICAgICAgICAgICAgICAudHJhbnNsYXRlKHhUcmFuc2xhdGUsIHlUcmFuc2xhdGUpKVxyXG4gICAgICAgICAgICAub24oXCJkYmxjbGljay56b29tXCIsIG51bGwpO1xyXG5cclxuICAgICAgICAvLyBEcmF3aW5nIHByaW1pdGl2ZXMuXHJcbiAgICAgICAgY29uc3QgbGluZXNIb3N0ID0gdGhpcy50b3BHcm91cC5hcHBlbmQoXCJnXCIpLmNsYXNzZWQoXCJsaW5lc0hvc3RcIiwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIHRoaXMubGluZXMgPSBsaW5lc0hvc3Quc2VsZWN0QWxsPFNWR0VsZW1lbnQsIFNpbXVsYXRpb25MaW5rRGF0dW08SUFUTkdyYXBoTGF5b3V0Tm9kZT4+KFwibGluZVwiKVxyXG4gICAgICAgICAgICAuZGF0YShsaW5rcylcclxuICAgICAgICAgICAgLmVudGVyKCkuYXBwZW5kKFwibGluZVwiKVxyXG4gICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwidHJhbnNpdGlvblwiKVxyXG4gICAgICAgICAgICAuYXR0cihcIm1hcmtlci1lbmRcIiwgKGxpbmspID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnROb2RlcyFbbGluay50YXJnZXRdLnR5cGUgPT09IEFUTlJ1bGVUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwidXJsKCN0cmFuc2l0aW9uRW5kUmVjdClcIjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJ1cmwoI3RyYW5zaXRpb25FbmRDaXJjbGUpXCI7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICBjb25zdCBzdGF0ZXNIb3N0ID0gdGhpcy50b3BHcm91cC5hcHBlbmQoXCJnXCIpLmNsYXNzZWQoXCJzdGF0ZXNIb3N0XCIsIHRydWUpO1xyXG5cclxuICAgICAgICBjb25zdCBzdGF0ZUVsZW1lbnRzID0gc3RhdGVzSG9zdC5zZWxlY3RBbGwoKS5kYXRhKHRoaXMuY3VycmVudE5vZGVzKTtcclxuICAgICAgICBzdGF0ZUVsZW1lbnRzLmVudGVyKCkuYXBwZW5kPFNWR0VsZW1lbnQ+KChub2RlKSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBzO1xyXG4gICAgICAgICAgICBsZXQgZWxlbWVudDtcclxuXHJcbiAgICAgICAgICAgIGxldCBjc3NDbGFzcyA9IFwic3RhdGUgXCIgKyBzdGF0ZVR5cGVbbm9kZS50eXBlXS5zaG9ydDtcclxuICAgICAgICAgICAgY29uc3QgcmVjdXJzaXZlID0gbm9kZS5uYW1lID09PSBkYXRhLnJ1bGVOYW1lO1xyXG4gICAgICAgICAgICBpZiAocmVjdXJzaXZlKSB7XHJcbiAgICAgICAgICAgICAgICBjc3NDbGFzcyArPSBcIiByZWN1cnNpdmVcIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKG5vZGUudHlwZSA9PT0gQVROUnVsZVR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcInJlY3RcIik7XHJcbiAgICAgICAgICAgICAgICBzID0gZDMuc2VsZWN0PFNWR0VsZW1lbnQsIElBVE5HcmFwaExheW91dE5vZGU+KGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCA1MCkgLy8gU2l6ZSBhbmQgb2Zmc2V0IGFyZSB1cGRhdGVkIGJlbG93LCBkZXBlbmRpbmcgb24gbGFiZWwgc2l6ZS5cclxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCA1MClcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcInlcIiwgLTI1KVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwicnhcIiwgNSlcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcInJ5XCIsIHJlY3Vyc2l2ZSA/IDIwIDogNSlcclxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIGNzc0NsYXNzKVxyXG4gICAgICAgICAgICAgICAgICAgIC5vbihcImRibGNsaWNrXCIsIHRoaXMuZG91YmxlQ2xpY2tlZClcclxuICAgICAgICAgICAgICAgICAgICAuY2FsbChkMy5kcmFnKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLm9uKFwic3RhcnRcIiwgdGhpcy5kcmFnU3RhcnRlZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgLm9uKFwiZHJhZ1wiLCB0aGlzLmRyYWdnZWQpLFxyXG4gICAgICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiwgXCJjaXJjbGVcIik7XHJcbiAgICAgICAgICAgICAgICBzID0gZDMuc2VsZWN0PFNWR0VsZW1lbnQsIElBVE5HcmFwaExheW91dE5vZGU+KGVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJyXCIsIDMwKVxyXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgY3NzQ2xhc3MpXHJcbiAgICAgICAgICAgICAgICAgICAgLm9uKFwiZGJsY2xpY2tcIiwgdGhpcy5kb3VibGVDbGlja2VkKVxyXG4gICAgICAgICAgICAgICAgICAgIC5jYWxsKGQzLmRyYWcoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAub24oXCJzdGFydFwiLCB0aGlzLmRyYWdTdGFydGVkKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAub24oXCJkcmFnXCIsIHRoaXMuZHJhZ2dlZCksXHJcbiAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcy5hcHBlbmQoXCJ0aXRsZVwiKS50ZXh0KHN0YXRlVHlwZVtub2RlLnR5cGVdLmxvbmcpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRoaXMuZmlndXJlcyA9IHN0YXRlc0hvc3Quc2VsZWN0QWxsPFNWR0VsZW1lbnQsIElBVE5HcmFwaExheW91dE5vZGU+KFwiLnN0YXRlXCIpLmRhdGEodGhpcy5jdXJyZW50Tm9kZXMpO1xyXG5cclxuICAgICAgICBjb25zdCB0ZXh0SG9zdCA9IHRoaXMudG9wR3JvdXAuYXBwZW5kKFwiZ1wiKS5jbGFzc2VkKFwidGV4dEhvc3RcIiwgdHJ1ZSk7XHJcbiAgICAgICAgdGhpcy50ZXh0U2VsZWN0aW9uID0gdGV4dEhvc3Quc2VsZWN0QWxsKFwidGV4dFwiKVxyXG4gICAgICAgICAgICAuZGF0YSh0aGlzLmN1cnJlbnROb2RlcylcclxuICAgICAgICAgICAgLmVudGVyKCkuYXBwZW5kKFwidGV4dFwiKVxyXG4gICAgICAgICAgICAuYXR0cihcInhcIiwgMClcclxuICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIDApXHJcbiAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJzdGF0ZUxhYmVsXCIpXHJcbiAgICAgICAgICAgIC50ZXh0KChkKSA9PiB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZC5uYW1lO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gR28gdGhyb3VnaCBhbGwgcmVjdCBlbGVtZW50cyBhbmQgcmVzaXplL29mZnNldCB0aGVtIGFjY29yZGluZyB0byB0aGVpciBsYWJlbCBzaXplcy5cclxuICAgICAgICBjb25zdCB0ZXh0Tm9kZXMgPSB0aGlzLnRleHRTZWxlY3Rpb24ubm9kZXMoKTtcclxuICAgICAgICBjb25zdCByZWN0Tm9kZXMgPSB0aGlzLmZpZ3VyZXMubm9kZXMoKTtcclxuXHJcbiAgICAgICAgY29uc3QgYm9yZGVyID0gMjA7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0ZXh0Tm9kZXMubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudE5vZGVzW2ldLnR5cGUgPT09IEFUTlJ1bGVUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBlbGVtZW50ID0gdGV4dE5vZGVzW2ldO1xyXG4gICAgICAgICAgICAgICAgbGV0IHdpZHRoID0gTWF0aC5jZWlsKGVsZW1lbnQuZ2V0Q29tcHV0ZWRUZXh0TGVuZ3RoKCkpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHdpZHRoIDwgNzApIHtcclxuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IDcwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgd2lkdGggKz0gYm9yZGVyO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVjdCA9IHJlY3ROb2Rlc1tpXTtcclxuICAgICAgICAgICAgICAgIHJlY3Quc2V0QXR0cmlidXRlKFwid2lkdGhcIiwgYCR7d2lkdGh9cHhgKTtcclxuICAgICAgICAgICAgICAgIHJlY3Quc2V0QXR0cmlidXRlKFwieFwiLCBgJHstd2lkdGggLyAyfXB4YCk7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50Tm9kZXNbaV0ud2lkdGggPSB3aWR0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb25Ib3N0ID0gdGhpcy50b3BHcm91cC5hcHBlbmQoXCJnXCIpLmNsYXNzZWQoXCJkZXNjcmlwdGlvbkhvc3RcIiwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIHRoaXMuZGVzY3JpcHRpb25zID0gZGVzY3JpcHRpb25Ib3N0LnNlbGVjdEFsbDxTVkdUZXh0RWxlbWVudCwgSUFUTkdyYXBoTGF5b3V0Tm9kZT4oXCJkZXNjcmlwdGlvblwiKVxyXG4gICAgICAgICAgICAuZGF0YSh0aGlzLmN1cnJlbnROb2RlcylcclxuICAgICAgICAgICAgLmVudGVyKCkuYXBwZW5kKFwidGV4dFwiKVxyXG4gICAgICAgICAgICAuYXR0cihcInhcIiwgMClcclxuICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIDEzKVxyXG4gICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwic3RhdGVUeXBlTGFiZWxcIilcclxuICAgICAgICAgICAgLnRleHQoKG5vZGUpID0+IHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0ZVR5cGVbbm9kZS50eXBlXS5zaG9ydDtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IGxhYmVsc0hvc3QgPSB0aGlzLnRvcEdyb3VwLmFwcGVuZChcImdcIikuY2xhc3NlZChcImxhYmVsc0hvc3RcIiwgdHJ1ZSk7XHJcblxyXG4gICAgICAgIHRoaXMubGlua0xhYmVscyA9IGxhYmVsc0hvc3Quc2VsZWN0QWxsKFwibGFiZWxzXCIpXHJcbiAgICAgICAgICAgIC5kYXRhKGxpbmtzKVxyXG4gICAgICAgICAgICAuZW50ZXIoKS5hcHBlbmQoXCJ0ZXh0XCIpXHJcbiAgICAgICAgICAgIC5hdHRyKFwieFwiLCAwKVxyXG4gICAgICAgICAgICAuYXR0cihcInlcIiwgMClcclxuICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImxpbmtMYWJlbFwiKVxyXG4gICAgICAgICAgICAuY2FsbCh0aGlzLmFwcGVuZExpbmtUZXh0KTtcclxuXHJcbiAgICAgICAgdGhpcy5zaW11bGF0aW9uID0gZDMuZm9yY2VTaW11bGF0aW9uKHRoaXMuY3VycmVudE5vZGVzKVxyXG4gICAgICAgICAgICAuZm9yY2UoXCJjaGFyZ2VcIiwgZDMuZm9yY2VNYW55Qm9keSgpLnN0cmVuZ3RoKC00MDApKVxyXG4gICAgICAgICAgICAuZm9yY2UoXCJjb2xsaWRlXCIsIGQzLmZvcmNlQ29sbGlkZSgxMDApLnN0cmVuZ3RoKDAuNSkuaXRlcmF0aW9ucygzKSlcclxuICAgICAgICAgICAgLmZvcmNlKFwibGlua1wiLCBkMy5mb3JjZUxpbmsobGlua3MpXHJcbiAgICAgICAgICAgICAgICAuZGlzdGFuY2UoMjAwKVxyXG4gICAgICAgICAgICAgICAgLnN0cmVuZ3RoKDIpKVxyXG4gICAgICAgICAgICAub24oXCJ0aWNrXCIsIHRoaXMuYW5pbWF0aW9uVGljaylcclxuICAgICAgICAgICAgLm9uKFwiZW5kXCIsIHRoaXMuYW5pbWF0aW9uRW5kKTtcclxuXHJcbiAgICAgICAgLy8gVGhlIHNpbXVsYXRpb24gYXV0b21hdGljYWxseSBzdGFydHMsIGJ1dCB3ZSB3YW50IHRvIGhhdmUgaXQgZmlyc3QgZG8gc29tZSBpdGVyYXRpb25zIGJlZm9yZVxyXG4gICAgICAgIC8vIHNob3dpbmcgdGhlIGluaXRpYWwgbGF5b3V0LiBNYWtlcyBmb3IgYSBtdWNoIGJldHRlciBpbml0aWFsIGRpc3BsYXkuXHJcbiAgICAgICAgdGhpcy5zaW11bGF0aW9uLnN0b3AoKTtcclxuXHJcbiAgICAgICAgLy8gRG8gYSBudW1iZXIgb2YgaXRlcmF0aW9ucyB3aXRob3V0IHZpc3VhbCB1cGRhdGUsIHdoaWNoIGlzIHVzdWFsbHkgdmVyeSBmYXN0IChtdWNoIGZhc3RlciB0aGFuIGFuaW1hdGluZ1xyXG4gICAgICAgIC8vIGVhY2ggc3RlcCkuXHJcbiAgICAgICAgdGhpcy5zaW11bGF0aW9uLnRpY2soMTAwKTtcclxuXHJcbiAgICAgICAgLy8gTm93IGRvIHRoZSBpbml0aWFsIHZpc3VhbCB1cGRhdGUuXHJcbiAgICAgICAgdGhpcy5hbmltYXRpb25UaWNrKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJlc2V0VHJhbnNmb3JtYXRpb24gPSAoeDogbnVtYmVyIHwgdW5kZWZpbmVkLCB5OiBudW1iZXIgfCB1bmRlZmluZWQsIHNjYWxlOiBudW1iZXIgfCB1bmRlZmluZWQpOiB2b2lkID0+IHtcclxuICAgICAgICBjb25zdCB4VHJhbnNsYXRlID0geCA/PyAodGhpcy5zdmcubm9kZSgpPy5jbGllbnRXaWR0aCA/PyAwKSAvIDI7XHJcbiAgICAgICAgY29uc3QgeVRyYW5zbGF0ZSA9IHkgPz8gKHRoaXMuc3ZnLm5vZGUoKT8uY2xpZW50SGVpZ2h0ID8/IDApIC8gMjtcclxuICAgICAgICB0aGlzLnN2Zy5jYWxsKHRoaXMuem9vbSlcclxuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC91bmJvdW5kLW1ldGhvZFxyXG4gICAgICAgICAgICAuY2FsbCh0aGlzLnpvb20udHJhbnNmb3JtLCBkMy56b29tSWRlbnRpdHlcclxuICAgICAgICAgICAgICAgIC5zY2FsZShzY2FsZSA/PyAwLjUpXHJcbiAgICAgICAgICAgICAgICAudHJhbnNsYXRlKHhUcmFuc2xhdGUsIHlUcmFuc2xhdGUpKTtcclxuXHJcbiAgICAgICAgdGhpcy5yZXNldE5vZGVQb3NpdGlvbnMoKTtcclxuICAgIH07XHJcblxyXG4gICAgcHJpdmF0ZSByZXNldE5vZGVQb3NpdGlvbnMoKTogdm9pZCB7XHJcbiAgICAgICAgLy8gTWFyayBzdGFydCBhbmQgZW5kIG5vZGVzIGFzIHZlcnRpY2FsbHkgZml4ZWQgaWYgbm90IGFscmVhZHkgZG9uZSBieSB0aGUgY2FsbGVyLlxyXG4gICAgICAgIC8vIEJlY2F1c2Ugb2YgdGhlIChpbml0aWFsKSB6b29tIHRyYW5zbGF0aW9uIHRoZSBvcmlnaW4gb2YgdGhlIFNWRyBpcyBpbiB0aGUgY2VudGVyLlxyXG4gICAgICAgIGZvciAoY29uc3Qgbm9kZSBvZiB0aGlzLmN1cnJlbnROb2RlcyEpIHtcclxuICAgICAgICAgICAgbm9kZS5meCA9IG51bGw7XHJcbiAgICAgICAgICAgIG5vZGUuZnkgPSBudWxsO1xyXG4gICAgICAgICAgICBpZiAobm9kZS50eXBlID09PSBBVE5TdGF0ZVR5cGUuUlVMRV9TVEFSVCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKG5vZGUueCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90ZTogdGhpcyBpcyBub3QgdGhlIGZpeGVkIHggcG9zaXRpb24sIGJ1dCB0aGUgaW5pdGlhbCB4IHBvc2l0aW9uLlxyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUueCA9IC0xMDAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICghbm9kZS5meSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGUuZnkgPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG5vZGUudHlwZSA9PT0gQVROU3RhdGVUeXBlLlJVTEVfU1RPUCkge1xyXG4gICAgICAgICAgICAgICAgLy8gRG9uJ3Qgc2V0IGFuIGluaXRpYWwgeCBwb3NpdGlvbiBmb3IgdGhlIGVuZCBub2RlLlxyXG4gICAgICAgICAgICAgICAgLy8gRm9yIHVua25vd24gcmVhc29ucyB0aGlzIG1ha2VzIGl0IGFwcGVhciBsZWZ0IHRvIHRoZSBzdGFydCBub2RlLlxyXG4gICAgICAgICAgICAgICAgaWYgKCFub2RlLmZ5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5meSA9IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTcGxpdHMgbGluayBsYWJlbCB0ZXh0IGludG8gbXVsdGlwbGUgdHNwYW4gZW50cmllcyBhbmQgYWRkcyB0aGVtIHRvIHRoZSBsaW5rIGVsZW1lbnRzLlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBsaW5rcyBUaGUgbGluayBlbGVtZW50cyB0byBwcm9jZXNzLlxyXG4gICAgICovXHJcbiAgICBwcml2YXRlIGFwcGVuZExpbmtUZXh0ID0gKGxpbmtzOiBBVE5MaW5rVGV4dFNlbGVjdGlvbik6IHZvaWQgPT4ge1xyXG4gICAgICAgIGxpbmtzLmVhY2goKGxpbmssIGluZGV4LCBsaXN0KSA9PiB7XHJcbiAgICAgICAgICAgIGxldCBsaW5lTnVtYmVyID0gMDtcclxuICAgICAgICAgICAgY29uc3QgZWxlbWVudCA9IGQzLnNlbGVjdChsaXN0W2luZGV4XSk7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgbGFiZWwgb2YgbGluay5sYWJlbHMpIHtcclxuICAgICAgICAgICAgICAgICsrbGluZU51bWJlcjtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNwYW4gPSBlbGVtZW50LmFwcGVuZChcInRzcGFuXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIDApXHJcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJkeVwiLCBcIjEuNWVtXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgLnRleHQobGFiZWwuY29udGVudCk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGxhYmVsLmNsYXNzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3Bhbi5jbGFzc2VkKGxhYmVsLmNsYXNzLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBpZiAobGluZU51bWJlciA9PT0gdGhpcy5tYXhMYWJlbENvdW50KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVtYWluaW5nQ291bnQgPSBsaW5rLmxhYmVscy5sZW5ndGggLSB0aGlzLm1heExhYmVsQ291bnQ7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlbWFpbmluZ0NvdW50ID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LmFwcGVuZChcInRzcGFuXCIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcInhcIiwgMClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiZHlcIiwgXCIxLjVlbVwiKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRleHQoYCR7bGluay5sYWJlbHMubGVuZ3RoIC0gdGhpcy5tYXhMYWJlbENvdW50fSBtb3JlIC4uLmApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgcHJpdmF0ZSBhbmltYXRpb25UaWNrID0gKCk6IHZvaWQgPT4ge1xyXG4gICAgICAgIHRoaXMuZmlndXJlcy5hdHRyKFwidHJhbnNmb3JtXCIsIHRoaXMudHJhbnNmb3JtKTtcclxuICAgICAgICB0aGlzLnRleHRTZWxlY3Rpb24uYXR0cihcInRyYW5zZm9ybVwiLCB0aGlzLnRyYW5zZm9ybSk7XHJcbiAgICAgICAgdGhpcy5kZXNjcmlwdGlvbnMuYXR0cihcInRyYW5zZm9ybVwiLCB0aGlzLnRyYW5zZm9ybSk7XHJcblxyXG4gICAgICAgIHRoaXMudHJhbnNmb3JtTGluZXMoKTtcclxuICAgICAgICB0aGlzLnRyYW5zZm9ybUxpbmtMYWJlbHMoKTtcclxuICAgIH07XHJcblxyXG4gICAgcHJpdmF0ZSBhbmltYXRpb25FbmQgPSAoKTogdm9pZCA9PiB7XHJcbiAgICAgICAgdGhpcy5maWd1cmVzLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgdGhpcy5zbmFwVHJhbnNmb3JtKTtcclxuICAgICAgICB0aGlzLnRleHRTZWxlY3Rpb24uYXR0cihcInRyYW5zZm9ybVwiLCB0aGlzLnNuYXBUcmFuc2Zvcm0pO1xyXG4gICAgICAgIHRoaXMuZGVzY3JpcHRpb25zLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgdGhpcy5zbmFwVHJhbnNmb3JtKTtcclxuXHJcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1MaW5lcygpO1xyXG4gICAgICAgIHRoaXMudHJhbnNmb3JtTGlua0xhYmVscygpO1xyXG4gICAgfTtcclxuXHJcbiAgICBwcml2YXRlIHRyYW5zZm9ybSA9IChub2RlOiBJQVROR3JhcGhMYXlvdXROb2RlKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIGB0cmFuc2xhdGUoJHtub2RlLnggPz8gMH0sJHtub2RlLnkgPz8gMH0pYDtcclxuICAgIH07XHJcblxyXG4gICAgcHJpdmF0ZSBzbmFwVHJhbnNmb3JtID0gKG5vZGU6IElBVE5HcmFwaExheW91dE5vZGUpID0+IHtcclxuICAgICAgICByZXR1cm4gYHRyYW5zbGF0ZSgke3RoaXMuc25hcFRvR3JpZChub2RlLnggPz8gMCl9LCR7dGhpcy5zbmFwVG9HcmlkKG5vZGUueSA/PyAwKX0pYDtcclxuICAgIH07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGb3IgbGlua3MgdGhhdCBlbmQgYXQgYSBydWxlIG5vZGUgd2UgaGF2ZSB0byBjb21wdXRlIHRoZSBlbmQgcG9zaXRpb24gc3VjaCB0aGF0IHdlXHJcbiAgICAgKiBlbmQgdXAgb24gdGhlIGJvcmRlciBvZiB0aGUgbm9kZSByZWN0YW5nbGUgKG90aGVyd2lzZSB0aGUgZW5kIG1hcmtlciB3b3VsZCBiZSBoaWRkZW4pLlxyXG4gICAgICogRm9yIG90aGVyIG5vZGVzIHdlIGNhbiB1c2UgYSBzdGF0aWMgbWFya2VyIG9mZnNldCAoYXMgZGVmaW5lZCBpbiB0aGUgc3ZnIGRlZnMgc2VjdGlvbikuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIGhvcml6b250YWwgSW5kaWNhdGVzIGlmIHRoZSBjb21wdXRhdGlvbiBpcyBkb25lIGZvciB4IHZhbHVlcyBvciB5IHZhbHVlcy5cclxuICAgICAqIEBwYXJhbSBlbGVtZW50IFRoZSBsaW5rIGZvciB3aGljaCB0byBjb21wdXRlIHRoZSBlbmQgY29vcmRpbmF0ZS5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyBUaGUgY29tcHV0ZWQgY29vcmRpbmF0ZShlaXRoZXIgZm9yIHggb3IgeSkuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgZW5kQ29vcmRpbmF0ZShob3Jpem9udGFsOiBib29sZWFuLCBlbGVtZW50OiBJQVROTGluayk6IG51bWJlciB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXNBVE5MYXlvdXROb2RlKGVsZW1lbnQuc291cmNlKSAmJiB0aGlzLmlzQVROTGF5b3V0Tm9kZShlbGVtZW50LnRhcmdldCkpIHtcclxuICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFyZ2V0LnR5cGUgPT09IEFUTlJ1bGVUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzb3VyY2VYID0gZWxlbWVudC5zb3VyY2UueCA/PyAwO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc291cmNlWSA9IGVsZW1lbnQuc291cmNlLnkgPz8gMDtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXRYID0gZWxlbWVudC50YXJnZXQueCA/PyAwO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0WSA9IGVsZW1lbnQudGFyZ2V0LnkgPz8gMDtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldFdpZHRoID0gZWxlbWVudC50YXJnZXQud2lkdGggPz8gMDtcclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBsaW5lMSA9IHtcclxuICAgICAgICAgICAgICAgICAgICB4MTogc291cmNlWCxcclxuICAgICAgICAgICAgICAgICAgICB5MTogc291cmNlWSxcclxuICAgICAgICAgICAgICAgICAgICB4MjogdGFyZ2V0WCxcclxuICAgICAgICAgICAgICAgICAgICB5MjogdGFyZ2V0WSxcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGxpbmUyID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHgxOiB0YXJnZXRYIC0gdGFyZ2V0V2lkdGggLyAyLFxyXG4gICAgICAgICAgICAgICAgICAgIHkxOiB0YXJnZXRZIC0gMjUsXHJcbiAgICAgICAgICAgICAgICAgICAgeDI6IHRhcmdldFggKyB0YXJnZXRXaWR0aCAvIDIsXHJcbiAgICAgICAgICAgICAgICAgICAgeTI6IHRhcmdldFkgLSAyNSxcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IGludGVyc2VjdGlvbiA9IHRoaXMubGluZUludGVyc2VjdGlvbihsaW5lMSwgbGluZTIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGludGVyc2VjdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBob3Jpem9udGFsID8gaW50ZXJzZWN0aW9uLnggOiBpbnRlcnNlY3Rpb24ueTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBsaW5lMiA9IHtcclxuICAgICAgICAgICAgICAgICAgICB4MTogdGFyZ2V0WCAtIHRhcmdldFdpZHRoIC8gMixcclxuICAgICAgICAgICAgICAgICAgICB5MTogdGFyZ2V0WSArIDI1LFxyXG4gICAgICAgICAgICAgICAgICAgIHgyOiB0YXJnZXRYICsgdGFyZ2V0V2lkdGggLyAyLFxyXG4gICAgICAgICAgICAgICAgICAgIHkyOiB0YXJnZXRZICsgMjUsXHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGludGVyc2VjdGlvbiA9IHRoaXMubGluZUludGVyc2VjdGlvbihsaW5lMSwgbGluZTIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGludGVyc2VjdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBob3Jpem9udGFsID8gaW50ZXJzZWN0aW9uLnggOiBpbnRlcnNlY3Rpb24ueTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBsaW5lMiA9IHtcclxuICAgICAgICAgICAgICAgICAgICB4MTogdGFyZ2V0WCAtIHRhcmdldFdpZHRoIC8gMixcclxuICAgICAgICAgICAgICAgICAgICB5MTogdGFyZ2V0WSAtIDI1LFxyXG4gICAgICAgICAgICAgICAgICAgIHgyOiB0YXJnZXRYIC0gdGFyZ2V0V2lkdGggLyAyLFxyXG4gICAgICAgICAgICAgICAgICAgIHkyOiB0YXJnZXRZICsgMjUsXHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGludGVyc2VjdGlvbiA9IHRoaXMubGluZUludGVyc2VjdGlvbihsaW5lMSwgbGluZTIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGludGVyc2VjdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBob3Jpem9udGFsID8gaW50ZXJzZWN0aW9uLnggOiBpbnRlcnNlY3Rpb24ueTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBsaW5lMiA9IHtcclxuICAgICAgICAgICAgICAgICAgICB4MTogdGFyZ2V0WCArIHRhcmdldFdpZHRoIC8gMixcclxuICAgICAgICAgICAgICAgICAgICB5MTogdGFyZ2V0WSAtIDI1LFxyXG4gICAgICAgICAgICAgICAgICAgIHgyOiB0YXJnZXRYICsgdGFyZ2V0V2lkdGggLyAyLFxyXG4gICAgICAgICAgICAgICAgICAgIHkyOiB0YXJnZXRZICsgMjUsXHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIGludGVyc2VjdGlvbiA9IHRoaXMubGluZUludGVyc2VjdGlvbihsaW5lMSwgbGluZTIpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGludGVyc2VjdGlvbikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBob3Jpem9udGFsID8gaW50ZXJzZWN0aW9uLnggOiBpbnRlcnNlY3Rpb24ueTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gRm9yIGNpcmNsZSBub2RlcyBvciB3aGVuIHRoZSBjZW50ZXIgb2YgdGhlIHNvdXJjZSBub2RlIGlzIHdpdGhpbiB0aGUgYm91bmRzIG9mIHRoZSB0YXJnZXQgbm9kZSByZWN0LlxyXG4gICAgICAgICAgICByZXR1cm4gKGhvcml6b250YWwgPyBlbGVtZW50LnRhcmdldC54IDogZWxlbWVudC50YXJnZXQueSkgPz8gMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ29tcHV0ZXMgdGhlIHBvaW50IHdoZXJlIHR3byBsaW5lcyBpbnRlcnNlY3QgZWFjaCBvdGhlci5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0gbGluZTEgVGhlIGZpcnN0IGxpbmUuXHJcbiAgICAgKiBAcGFyYW0gbGluZTIgVGhlIHNlY29uZCBsaW5lLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIGFuIG9iamVjdCB3aXRoIHRoZSBjb21wdXRlZCBjb29yZGluYXRlcyBvciB1bmRlZmluZWQsIGlmIHRoZSBsaW5lcyBhcmUgcGFyYWxsZWwuXHJcbiAgICAgKi9cclxuICAgIHByaXZhdGUgbGluZUludGVyc2VjdGlvbihsaW5lMTogSUxpbmUsIGxpbmUyOiBJTGluZSk6IHsgeDogbnVtYmVyOyB5OiBudW1iZXI7IH0gfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGNvbnN0IHMxWCA9IGxpbmUxLngyIC0gbGluZTEueDE7XHJcbiAgICAgICAgY29uc3QgczFZID0gbGluZTEueTIgLSBsaW5lMS55MTtcclxuICAgICAgICBjb25zdCBzMlggPSBsaW5lMi54MiAtIGxpbmUyLngxO1xyXG4gICAgICAgIGNvbnN0IHMyWSA9IGxpbmUyLnkyIC0gbGluZTIueTE7XHJcblxyXG4gICAgICAgIGNvbnN0IHMgPSAoLXMxWSAqIChsaW5lMS54MSAtIGxpbmUyLngxKSArIHMxWCAqIChsaW5lMS55MSAtIGxpbmUyLnkxKSkgLyAoLXMyWCAqIHMxWSArIHMxWCAqIHMyWSk7XHJcbiAgICAgICAgY29uc3QgdCA9IChzMlggKiAobGluZTEueTEgLSBsaW5lMi55MSkgLSBzMlkgKiAobGluZTEueDEgLSBsaW5lMi54MSkpIC8gKC1zMlggKiBzMVkgKyBzMVggKiBzMlkpO1xyXG5cclxuICAgICAgICBpZiAocyA+PSAwICYmIHMgPD0gMSAmJiB0ID49IDAgJiYgdCA8PSAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICB4OiBsaW5lMS54MSArICh0ICogczFYKSxcclxuICAgICAgICAgICAgICAgIHk6IGxpbmUxLnkxICsgKHQgKiBzMVkpLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHRyYW5zZm9ybUxpbmtMYWJlbHMoKTogdm9pZCB7XHJcbiAgICAgICAgdGhpcy5saW5rTGFiZWxzXHJcbiAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIChsaW5rKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAvLyBXZSBoYXZlIHRvIGNvbXB1dGUgdGhlIHNsb3BlIG9mIHRoZSBsYWJlbCBhbmQgaXRzIHBvc2l0aW9uLlxyXG4gICAgICAgICAgICAgICAgLy8gRm9yIHRoZSBmaXJzdCB3ZSBuZWVkIHRoZSBjZW50ZXIgY29vcmRpbmF0ZXMgb2YgdGhlIGZpZ3VyZXMsIHdoaWxlIHBvc2l0aW9uaW5nIGRlcGVuZHMgb24gdGhlIHNpemVcclxuICAgICAgICAgICAgICAgIC8vIG9mIHRoZSBmaWd1cmVzLlxyXG4gICAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0WSA9IHRoaXMuaXNTaW11bGF0aW9uTm9kZURhdHVtKGxpbmsudGFyZ2V0KSA/IGxpbmsudGFyZ2V0LnkgPz8gMCA6IDA7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzb3VyY2VZID0gdGhpcy5pc1NpbXVsYXRpb25Ob2RlRGF0dW0obGluay5zb3VyY2UpID8gbGluay5zb3VyY2UueSA/PyAwIDogMDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBGb3IgcnVsZSBmaWd1cmVzIHdlIGNvbXB1dGVkIGEgd2lkdGggdmFsdWUgYmVmb3JlLCB3aGljaCB3ZSBjYW4gdXNlIGhlcmUgdG8gYWRqdXN0IHRoZVxyXG4gICAgICAgICAgICAgICAgLy8gaG9yaXpvbnRhbCBjb29yZGluYXRlcyB0byBhY2NvdW50IGZvciBkaWZmZXJlbnQgcnVsZSBuYW1lIGxlbmd0aHMuXHJcbiAgICAgICAgICAgICAgICBsZXQgc291cmNlWCA9IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc1NpbXVsYXRpb25Ob2RlRGF0dW0obGluay5zb3VyY2UpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc291cmNlWCA9IGxpbmsuc291cmNlLnggPz8gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0WCA9IDA7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc1NpbXVsYXRpb25Ob2RlRGF0dW0obGluay50YXJnZXQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0WCA9IGxpbmsudGFyZ2V0LnggPz8gMDtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBjb25zdCBzbG9wZSA9IE1hdGguYXRhbjIoKHRhcmdldFkgLSBzb3VyY2VZKSwgKHRhcmdldFggLSBzb3VyY2VYKSkgKiAxODAgLyBNYXRoLlBJO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIE5vdyB0aGF0IGhhdmUgdGhlIHNsb3BlLCB1cGRhdGUgdGhlIGF2YWlsYWJsZSBob3Jpem9udGFsIHJhbmdlLlxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNTaW11bGF0aW9uTm9kZURhdHVtKGxpbmsuc291cmNlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsaW5rLnNvdXJjZS53aWR0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VYICs9IGxpbmsuc291cmNlLndpZHRoIC8gMjtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2VYICs9IDI1OyAvLyBUaGUgY2lyY2xlIHJhZGl1cyArIGJvcmRlci5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNTaW11bGF0aW9uTm9kZURhdHVtKGxpbmsudGFyZ2V0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsaW5rLnRhcmdldC53aWR0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRYIC09IGxpbmsudGFyZ2V0LndpZHRoIC8gMjtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRYIC09IDI1OyAvLyBUaGUgY2lyY2xlIHJhZGl1cyArIGJvcmRlci5cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgbGV0IHhPZmZzZXQgPSAwO1xyXG4gICAgICAgICAgICAgICAgbGV0IHlPZmZzZXQgPSAwO1xyXG4gICAgICAgICAgICAgICAgbGV0IGVmZmVjdGl2ZVNsb3BlID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIChzbG9wZSA+IC00NSAmJiBzbG9wZSA8IDQ1KToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlZmZlY3RpdmVTbG9wZSA9IHNsb3BlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgKHNsb3BlIDwgLTEzNSB8fCBzbG9wZSA+IDEzNSk6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWZmZWN0aXZlU2xvcGUgPSBzbG9wZSArIDE4MDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeE9mZnNldCA9IDEwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgKHNsb3BlID49IDQ1IHx8IHNsb3BlIDw9IC00NSk6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeE9mZnNldCA9IDEwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5T2Zmc2V0ID0gLTEwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGB0cmFuc2xhdGUoJHsodGFyZ2V0WCArIHNvdXJjZVgpIC8gMn0sICR7KHRhcmdldFkgKyBzb3VyY2VZKSAvIDJ9KSByb3RhdGUoJHtlZmZlY3RpdmVTbG9wZX0pIGAgK1xyXG4gICAgICAgICAgICAgICAgICAgIGB0cmFuc2xhdGUoJHt4T2Zmc2V0fSwgJHt5T2Zmc2V0fSlgO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHRyYW5zZm9ybUxpbmVzKCk6IHZvaWQge1xyXG4gICAgICAgIHRoaXMubGluZXNcclxuICAgICAgICAgICAgLmF0dHIoXCJ4MVwiLCAobGluaykgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNBVE5MYXlvdXROb2RlKGxpbmsuc291cmNlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsaW5rLnNvdXJjZS54ID8/IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hdHRyKFwieTFcIiwgKGxpbmspID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzQVROTGF5b3V0Tm9kZShsaW5rLnNvdXJjZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGluay5zb3VyY2UueSA/PyAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYXR0cihcIngyXCIsIChsaW5rKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0FUTkxheW91dE5vZGUobGluay50YXJnZXQpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGluay50YXJnZXQuZW5kWCA9IHRoaXMuZW5kQ29vcmRpbmF0ZSh0cnVlLCBsaW5rKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxpbmsudGFyZ2V0LmVuZFg7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hdHRyKFwieTJcIiwgKGxpbmspID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzQVROTGF5b3V0Tm9kZShsaW5rLnRhcmdldCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBsaW5rLnRhcmdldC5lbmRZID0gdGhpcy5lbmRDb29yZGluYXRlKGZhbHNlLCBsaW5rKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxpbmsudGFyZ2V0LmVuZFk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgZHJhZ1N0YXJ0ZWQgPSAoZTogQVROR3JhcGhEcmFnRXZlbnQpID0+IHtcclxuICAgICAgICBpZiAoIWUuYWN0aXZlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2ltdWxhdGlvbi5hbHBoYVRhcmdldCgwLjMpLnJlc3RhcnQoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGUuc3ViamVjdC5meCA9IGUueDtcclxuICAgICAgICBlLnN1YmplY3QuZnkgPSBlLnk7XHJcbiAgICB9O1xyXG5cclxuICAgIHByaXZhdGUgZHJhZ2dlZCA9IChlOiBBVE5HcmFwaERyYWdFdmVudCkgPT4ge1xyXG4gICAgICAgIGUuc3ViamVjdC5meCA9IHRoaXMuc25hcFRvR3JpZChlLngpO1xyXG4gICAgICAgIGUuc3ViamVjdC5meSA9IHRoaXMuc25hcFRvR3JpZChlLnkpO1xyXG4gICAgfTtcclxuXHJcbiAgICBwcml2YXRlIGRvdWJsZUNsaWNrZWQgPSAoX2V2ZW50OiBNb3VzZUV2ZW50LCBkYXRhOiB1bmtub3duKSA9PiB7XHJcbiAgICAgICAgY29uc3Qgbm9kZSA9IGRhdGEgYXMgSUFUTkdyYXBoTGF5b3V0Tm9kZTtcclxuICAgICAgICBub2RlLmZ4ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgIG5vZGUuZnkgPSB1bmRlZmluZWQ7XHJcbiAgICB9O1xyXG5cclxuICAgIHByaXZhdGUgc25hcFRvR3JpZCh2YWx1ZTogbnVtYmVyKTogbnVtYmVyIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5yb3VuZCh2YWx1ZSAvIEFUTkdyYXBoUmVuZGVyZXIuZ3JpZFNpemUpICogQVROR3JhcGhSZW5kZXJlci5ncmlkU2l6ZTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIGlzQVROTGF5b3V0Tm9kZShub2RlOiBzdHJpbmcgfCBudW1iZXIgfCBJQVROR3JhcGhMYXlvdXROb2RlKTogbm9kZSBpcyBJQVROR3JhcGhMYXlvdXROb2RlIHtcclxuICAgICAgICByZXR1cm4gKHR5cGVvZiBub2RlICE9PSBcInN0cmluZ1wiKSAmJiAodHlwZW9mIG5vZGUgIT09IFwibnVtYmVyXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgaXNTaW11bGF0aW9uTm9kZURhdHVtKG5vZGU6IHN0cmluZyB8IG51bWJlciB8IGQzLlNpbXVsYXRpb25Ob2RlRGF0dW0pOiBub2RlIGlzIFNpbXVsYXRpb25Ob2RlRGF0dW0ge1xyXG4gICAgICAgIHJldHVybiAodHlwZW9mIG5vZGUgIT09IFwic3RyaW5nXCIpICYmICh0eXBlb2Ygbm9kZSAhPT0gXCJudW1iZXJcIik7XHJcbiAgICB9XHJcbn1cclxuIl19