import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
import CustomTextRenderer from './CustomTextRenderer';
import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  create as svgCreate
} from 'tiny-svg';

import {
  getRoundRectPath
} from 'bpmn-js/lib/draw/BpmnRenderUtil';

import {
  is,
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import { isNil } from 'min-dash';

const HIGH_PRIORITY = 1500,
      TASK_BORDER_RADIUS = 2,
      COLOR_GREEN = '#52B415',
      COLOR_YELLOW = '#ffc800',
      COLOR_RED = '#cc0000',
      SHAPE_SHOPPINGFLOW = "SF",
      SHAPE_FETCHPRICE = "FP",
      SHAPE_PROCESSPRICE = "PP",
      SUITABILITY_PROCESS_PRICE = "PROCESS_PRICE",
      SUITABILITY_FETCH_PRICE = "FETCH_PRICE",
      SUITABILITY_SHOPPING_FLOW = "SHOPPING_FLOW";


export default class CustomRenderer extends BaseRenderer {
  constructor(eventBus, bpmnRenderer) {
    super(eventBus, HIGH_PRIORITY);

    this.bpmnRenderer = bpmnRenderer;
  }

  canRender(element) {

    // ignore labels
    return !element.labelTarget;
  }

  drawShape(parentNode, element) {
    const shape = this.bpmnRenderer.drawShape(parentNode, element);

    const suitabilityScore = this.getSuitabilityScore(element);

    if (!isNil(suitabilityScore)) {
      const color = this.getColor(suitabilityScore);
      const shapeType = this.getShapeType(suitabilityScore);
      this.setParentNodeStyle(shape, suitabilityScore);
      const rect = drawRect(parentNode, 25, 20, TASK_BORDER_RADIUS, color, shapeType);
  
      svgAttr(rect, {
        transform: 'translate(-13, -10)'
      });

      var text = svgCreate('text');
      //var customTextRenderer = new CustomTextRenderer({ element: element });
      //var contentText = this.getContentText(element, suitabilityScore);
      //var textContent = customTextRenderer.createTextContent(parentNode, contentText || '');
      var textContent = this.createTextContent(parentNode, element, suitabilityScore);

      svgAttr(text, {
        fill: '#fff',
        transform: 'translate(-8, 5)'
      });

      svgClasses(text).add('djs-label');
      svgClasses(textContent).add('djs-textContent');
    
      svgAppend(text, document.createTextNode(shapeType));
    
      svgAppend(parentNode, text);
      svgAppend(parentNode, textContent);
    }

    return shape;
  }

  getShapePath(shape) {
    if (is(shape, 'bpmn:Task')) {
      return getRoundRectPath(shape, TASK_BORDER_RADIUS);
    }

    return this.bpmnRenderer.getShapePath(shape);
  }

  getSuitabilityScore(element) {
    const businessObject = getBusinessObject(element);
  
    const { customElementName } = businessObject;

    return customElementName ? customElementName : null;
  }

  getColor(suitabilityScore) {
    if (suitabilityScore == SUITABILITY_PROCESS_PRICE) {
      return COLOR_GREEN;
    } else if (suitabilityScore == SUITABILITY_FETCH_PRICE) {
      return COLOR_YELLOW;
    }
    return COLOR_RED;
  }

  getShapeType(suitabilityScore) {
    if (suitabilityScore == SUITABILITY_SHOPPING_FLOW) {
      return SHAPE_SHOPPINGFLOW;
    } else if (suitabilityScore == SUITABILITY_FETCH_PRICE) {
      return SHAPE_FETCHPRICE;
    } 
    return SHAPE_PROCESSPRICE;
  }

  createTextContent(parentNode, element, suitabilityScore) {
    const businessObject = getBusinessObject(element),
          customTextRenderer = new CustomTextRenderer({ element: element }),
          FF_PRICE_LIST = "pricelist",
          PP_ADJUSTMENT_OPERATION = "ppAdjustmentOperation",
          PP_ADJUSTMENT_VALUE = "ppAdjustmentValue",
          PP_ROUNDOFF_OPERATION = "ppRoundoffOperation",
          PP_ROUNDOFF_VALUE = "ppRoundoffValue",
          PP_ROUNDOFF_NO_OPERATION = "No rounding off",
          PP_ADJUSTMENT_NO_OPERATION = "No adjustments";
    var contentText = "";
    if (suitabilityScore == SUITABILITY_PROCESS_PRICE) {
      var adjustmentContentText = businessObject.$attrs[PP_ADJUSTMENT_OPERATION] || PP_ADJUSTMENT_NO_OPERATION;
      adjustmentContentText = adjustmentContentText + (businessObject.$attrs[PP_ADJUSTMENT_VALUE] ? " " + businessObject.$attrs[PP_ADJUSTMENT_VALUE] : "");

      var roundOffContentText = businessObject.$attrs[PP_ROUNDOFF_OPERATION] || PP_ROUNDOFF_NO_OPERATION;
      roundOffContentText = roundOffContentText + (businessObject.$attrs[PP_ROUNDOFF_VALUE] ? ": " + businessObject.$attrs[PP_ROUNDOFF_VALUE] : "");

      contentText = adjustmentContentText + ", " + roundOffContentText;
    } else if (suitabilityScore == SUITABILITY_FETCH_PRICE) {
      contentText = businessObject.$attrs[FF_PRICE_LIST] || "";
    }
    return customTextRenderer.createTextContent(parentNode, contentText);
  }

  setParentNodeStyle(parentNode, suitabilityScore)
  {
    if (suitabilityScore == SUITABILITY_SHOPPING_FLOW) {
      parentNode.style.stroke = COLOR_RED;
    } 
    else if (suitabilityScore == SUITABILITY_FETCH_PRICE) {
      parentNode.style.stroke = COLOR_YELLOW;
    }
    else if(suitabilityScore == SUITABILITY_PROCESS_PRICE)
    {
      parentNode.style.stroke = COLOR_GREEN;
    }
  }
}

CustomRenderer.$inject = [ 'eventBus', 'bpmnRenderer' ];

// helpers //////////

// copied from https://github.com/bpmn-io/bpmn-js/blob/master/lib/draw/BpmnRenderer.js
function drawRect(parentNode, width, height, borderRadius, color) {
  const rect = svgCreate('rect');

  svgAttr(rect, {
    width: width,
    height: height,
    rx: borderRadius,
    ry: borderRadius,
    stroke: color,
    strokeWidth: 2,
    fill: color
  });

  svgAppend(parentNode, rect);

  return rect;
}