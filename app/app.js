import $ from 'jquery';

import PaletteProvider from 'bpmn-js/lib/features/palette/PaletteProvider';
import ContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider';

import BpmnModeler from 'bpmn-js/lib/Modeler';
import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/bpmn';
//import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';

import diagramXML from '../resources/diagram.bpmn';

import customModule from './custom';

import custeleExtension from '../resources/custelem';

const HIGH_PRIORITY = 1500;

const containerEl = document.getElementById('container'),
      qualityAssuranceEl = document.getElementById('quality-assurance'),
      suitabilityScoreEl = document.getElementById('suitability-score'),
      lastCheckedEl = document.getElementById('last-checked'),
      okayEl = document.getElementById('okay'),
      formEl = document.getElementById('form'),
      warningEl = document.getElementById('warning');

var _getPaletteEntries = PaletteProvider.prototype.getPaletteEntries;
PaletteProvider.prototype.getPaletteEntries = function(element) {
    var entries = _getPaletteEntries.apply(this);
    delete entries['create.intermediate-event'];
    delete entries['create.task'];
    delete entries['create.data-object'];
    delete entries['create.end-event'];
    delete entries['create.participant-expanded'];
    delete entries['create.subprocess-expanded'];
    delete entries['create.data-store'];
    delete entries['space-tool'];
    delete entries['global-connect-tool'];
    return entries; 
};

function updateAction(type, group, className, title, options) {

  function createListener(event) {
    var shape = elementFactory.createShape(assign({ type: type }, options));

    if (options) {
      shape.businessObject.di.isExpanded = options.isExpanded;
    }

    create.start(event, shape);
  }

  var shortType = type.replace(/^bpmn:/, '');

  return {
    group: group,
    className: className,
    title: title || translate('Create {type}', { type: shortType }),
    action: {
      dragstart: createListener,
      click: createListener
    }
  };
}

var _getContextPadEntries = ContextPadProvider.prototype.getContextPadEntries;
ContextPadProvider.prototype.getContextPadEntries = function(element) {
    var entries = _getContextPadEntries.apply(this, [element]);
    delete entries['append.end-event'];
    delete entries['append.append-task'];
    delete entries['append.intermediate-event'];
    delete entries['append.text-annotation'];
    delete entries['replace'];

    //entries['create.exclusive-gateway'].action.dragstart = updateAction();
    //entries['create.exclusive-gateway'].action.click = updateAction();
    return entries; 
};
      
var container = $('#js-drop-zone');
// hide quality assurance if user clicks outside
/*window.addEventListener('click', (event) => {
  const { target } = event;

  if (target === qualityAssuranceEl || qualityAssuranceEl.contains(target)) {
    return;
  }

  qualityAssuranceEl.classList.add('hidden');
});*/

// create modeler
const bpmnModeler = new BpmnModeler({
  container: '#js-canvas',
  propertiesPanel: {
    parent: '#js-properties-panel'
  },
  additionalModules: [
    customModule,
    propertiesPanelModule,
    propertiesProviderModule
  ],
  moddleExtensions: {
    custele: custeleExtension
  },
  keyboard: { bindTo: document }
});


function createNewDiagram() {
  openDiagram(diagramXML);
}

function openDiagram(diagramXML) {
// import XML
bpmnModeler.importXML(diagramXML, (err) => {
  if (err) {
    container
      .removeClass('with-diagram')
      .addClass('with-error');

    container.find('.error pre').text(err.message);

    console.error(err);
  } else {
    container
      .removeClass('with-error')
      .addClass('with-diagram');
  }

  /*const moddle = bpmnModeler.get('moddle'),
        modeling = bpmnModeler.get('modeling');

  let analysisDetails,
      businessObject,
      element,
      suitabilityScore;

  // validate suitability score
  function validate() {
    const { value } = suitabilityScoreEl;

    if (isNaN(value)) {
      warningEl.classList.remove('hidden');
      okayEl.disabled = true;
    } else {
      warningEl.classList.add('hidden');
      okayEl.disabled = false;
    }
  }

  // open quality assurance if user right clicks on element
  bpmnModeler.on('element.contextmenu', HIGH_PRIORITY, (event) => {
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();

    qualityAssuranceEl.classList.remove('hidden');

    ({ element } = event);
  
    // ignore root element
    if (!element.parent) {
      return;
    }

    businessObject = getBusinessObject(element);
  
    let { suitable } = businessObject;
    
    suitabilityScoreEl.value = suitable ? suitable : '';

    suitabilityScoreEl.focus();

    analysisDetails = getExtensionElement(businessObject, 'qa:AnalysisDetails');

    lastCheckedEl.textContent = analysisDetails ? analysisDetails.lastChecked : '-';

    validate();
  });

  // set suitability core and last checked if user submits
  formEl.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopPropagation();

    suitabilityScore = Number(suitabilityScoreEl.value);

    if (isNaN(suitabilityScore)) {
      return;
    }

    const extensionElements = businessObject.extensionElements || moddle.create('bpmn:ExtensionElements');

    if (!analysisDetails) {
      analysisDetails = moddle.create('qa:AnalysisDetails');

      extensionElements.get('values').push(analysisDetails);
    }

    analysisDetails.lastChecked = new Date().toISOString();

    modeling.updateProperties(element, {
      extensionElements,
      suitable: suitabilityScore
    });

    qualityAssuranceEl.classList.add('hidden');
  });

  // close quality assurance if user presses escape
  formEl.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      qualityAssuranceEl.classList.add('hidden');
    }
  });

  // validate suitability score if user inputs value
  suitabilityScoreEl.addEventListener('input', validate);*/

});

}


function saveSVG(done) {
  bpmnModeler.saveSVG(done);
}

function saveDiagram(done) {

  bpmnModeler.saveXML({ format: true }, function(err, xml) {
    done(err, xml);
  });
}


function registerFileDrop(container, callback) {

  function handleFileSelect(e) {
    e.stopPropagation();
    e.preventDefault();

    var files = e.dataTransfer.files;
    var file = files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
      var xml = e.target.result;
      callback(xml);
    };

    reader.readAsText(file);
  }

  function handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();

    e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

  container.get(0).addEventListener('dragover', handleDragOver, false);
  container.get(0).addEventListener('drop', handleFileSelect, false);
}


// file drag / drop ///////////////////////

// check file api availability
if (!window.FileList || !window.FileReader) {
  window.alert(
    'Looks like you use an older browser that does not support drag and drop. ' +
    'Try using Chrome, Firefox or the Internet Explorer > 10.');
} else {
  registerFileDrop(container, openDiagram);
}

function getExtensionElement(element, type) {
  if (!element.extensionElements) {
    return;
  }

  return element.extensionElements.values.filter((extensionElement) => {
    return extensionElement.$instanceOf(type);
  })[0];
}

// bootstrap diagram functions

$(function() {
 
  $('#js-create-diagram').click(function(e) {
    e.stopPropagation();
    e.preventDefault();

    createNewDiagram();
  });

  var downloadLink = $('#js-download-diagram');
  var downloadSvgLink = $('#js-download-svg');

  $('.buttons a').click(function(e) {
    if (!$(this).is('.active')) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  function setEncoded(link, name, data) {
    var encodedData = encodeURIComponent(data);

    if (data) {
      link.addClass('active').attr({
        'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
        'download': name
      });
    } else {
      link.removeClass('active');
    }
  }

  var exportArtifacts = debounce(function() {

    saveSVG(function(err, svg) {
      setEncoded(downloadSvgLink, 'diagram.svg', err ? null : svg);
    });

    saveDiagram(function(err, xml) {
      setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
    });
  }, 500);

  bpmnModeler.on('commandStack.changed', exportArtifacts);
});

// helpers //////////////////////

function debounce(fn, timeout) {

  var timer;

  return function() {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(fn, timeout);
  };
}