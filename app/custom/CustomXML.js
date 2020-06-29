const SUITABILITY_PROCESS_PRICE = "PROCESS_PRICE",
      SUITABILITY_FETCH_PRICE = "FETCH_PRICE";

export default class CustomXML{

  static getIOSpecification(bpmnFactory) {
    var ioSpecification = bpmnFactory.create('bpmn:InputOutputSpecification');
  
    var dataInput = "";
    for(var i = 0; i < 1; i++)
    {
      dataInput = bpmnFactory.create('bpmn:DataInput');
      dataInput.id = "DataInput_"+i;
      dataInput.name = "collectionId";
      ioSpecification.get('dataInputs').push(dataInput);
    }
  
    var dataOutput = bpmnFactory.create('bpmn:DataOutput');
    dataOutput.id = "DataOutput_0";
  
    var inputSet = bpmnFactory.create('bpmn:InputSet');
    inputSet.id = "InputSet_0";
  
      var dataInputRef = bpmnFactory.create('bpmn:DataInput');
      dataInputRef.id = "DataOutput_0";
  
      inputSet.get('dataInputRefs').push(dataInputRef);
  
    var outputSet = bpmnFactory.create('bpmn:OutputSet');
    outputSet.id = "OutputSet_0";
  
      var dataOutputRef = bpmnFactory.create('bpmn:DataOutput');
      dataOutputRef.id = "DataOutput_0";
  
      outputSet.get('dataOutputRefs').push(dataInputRef);
    // using get(...) to fail safe initialize a collection property
    //ioSpecification.get('dataInputs').push(dataInput);
    ioSpecification.get('dataOutputs').push(dataOutput);
    ioSpecification.get('inputSets').push(inputSet);
    ioSpecification.get('outputSets').push(outputSet);
    
    /*bpmnFactory.create('bpmn:InputOutputSpecification', {
      dataInputs: [ dataInput ]
    });*/
  
    return ioSpecification;
  }
  
  static getInpAssociation(bpmnFactory, create) {
    var dataInputAssociation = bpmnFactory.create('bpmn:DataInputAssociation');
    dataInputAssociation.id = "dataInputAssociation_1";
  
    var sourceRef = bpmnFactory.create('bpmn:ItemAwareElement');
    sourceRef.value = "DataInput_0";
  
    var targetRef = bpmnFactory.create('bpmn:ItemAwareElement');
    targetRef.value = "collectionId";
  
    dataInputAssociation.get('sourceRef').push(sourceRef);
    dataInputAssociation.get('targetRef').push(targetRef);
  
    return dataInputAssociation;
  }

}