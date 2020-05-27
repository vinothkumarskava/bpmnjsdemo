const SUITABILITY_PROCESS_PRICE = "PROCESS_PRICE",
      SUITABILITY_FETCH_PRICE = "FETCH_PRICE",
      SUITABILITY_SHOPPING_FLOW = "SHOPPING_FLOW";

export default class CustomPalette {
  constructor(bpmnFactory, create, elementFactory, palette, translate) {
    this.bpmnFactory = bpmnFactory;
    this.create = create;
    this.elementFactory = elementFactory;
    this.translate = translate;
    palette.registerProvider(this);
  }
  
  getPaletteEntries(element) {
    const {
      bpmnFactory,
      create,
      elementFactory,
      translate
    } = this;

    function createTask(suitabilityScore) {
      return function(event) {
        const businessObject = bpmnFactory.create('bpmn:Task');
  
        businessObject.customElementName = suitabilityScore;
  
        const shape = elementFactory.createShape({
          type: 'bpmn:Task',
          businessObject: businessObject
        });
  
        create.start(event, shape); 
      }
    }

    return {
      'create.low-task': {
        group: 'activity',
        className: 'bpmn-icon-task red',
        title: translate('Create Task for Shopping Flow'),
        action: {
          dragstart: createTask(SUITABILITY_SHOPPING_FLOW),
          click: createTask(SUITABILITY_SHOPPING_FLOW)
        }
      },
      'create.average-task': {
        group: 'activity',
        className: 'bpmn-icon-task yellow',
        title: translate('Create Task for Fetch Price'),
        action: {
          dragstart: createTask(SUITABILITY_FETCH_PRICE),
          click: createTask(SUITABILITY_FETCH_PRICE)
        }
      },
      'create.high-task': {
        group: 'activity',
        className: 'bpmn-icon-task green',
        title: translate('Create Task for Process Price'),
        action: {
          dragstart: createTask(SUITABILITY_PROCESS_PRICE),
          click: createTask(SUITABILITY_PROCESS_PRICE)
        }
      }
    }
  }
}

CustomPalette.$inject = [
  'bpmnFactory',
  'create',
  'elementFactory',
  'palette',
  'translate'
];