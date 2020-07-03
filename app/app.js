import $ from 'jquery';

import PaletteProvider from 'bpmn-js/lib/features/palette/PaletteProvider';
import ContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider';

import BpmnModeler from 'bpmn-js/lib/Modeler';
import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/bpmn';
import BpmnPropertiesProvider from 'bpmn-js-properties-panel/lib/provider/bpmn/BpmnPropertiesProvider';
import defaultDiagramXML from '../resources/diagram.bpmn';
import customModule from './custom';
import custeleExtension from '../resources/custelem.json';
import bpmnExtension from '../resources/bpmn.json';

function init(configData, diagramXML, savePriceRuleCbk)
{
  var _getPaletteEntries = PaletteProvider.prototype.getPaletteEntries;
  PaletteProvider.prototype.getPaletteEntries = function(element) {
      var entries = _getPaletteEntries.apply(this);
      delete entries['create.intermediate-event'];
      delete entries['create.task'];
      delete entries['create.data-object'];
      delete entries['create.participant-expanded'];
      delete entries['create.subprocess-expanded'];
      delete entries['create.data-store'];
      delete entries['space-tool'];
      delete entries['global-connect-tool'];
      return entries; 
  };

  var _getContextPadEntries = ContextPadProvider.prototype.getContextPadEntries;
  ContextPadProvider.prototype.getContextPadEntries = function(element) {
      var entries = _getContextPadEntries.apply(this, [element]);
      delete entries['append.append-task'];
      delete entries['append.intermediate-event'];
      delete entries['append.text-annotation'];
      delete entries['replace'];
      return entries; 
  };

  BpmnPropertiesProvider.prototype.getElementsConfigurations = function() {
    return configData;
  };
        
  var container = $('#js-drop-zone');
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
      custele: custeleExtension,
      bpmn: bpmnExtension
    },
    keyboard: { bindTo: document }
  });


  function createNewDiagram() {
    openDiagram(defaultDiagramXML);
  }

  function openDiagram(xml) {
  // import XML
  bpmnModeler.importXML(xml, (err) => {
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
      if (!isLocal && savePriceRuleCbk && typeof(savePriceRuleCbk) == 'function') {
        savePriceRuleCbk(err, xml);
      }
      setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
    });
  }, 500);

  bpmnModeler.on('commandStack.changed', exportArtifacts);

  if(!isLocal) {
    openDiagram(diagramXML || defaultDiagramXML);
  }
}

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

window.init = init;