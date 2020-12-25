function replace() {
  //cache to bypass the Maximum execution time
  var cache = CacheService.getScriptCache();

  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheetGoogleForms = spreadSheet.getSheetByName("Google Forms");
  var sheetReplace = spreadSheet.getSheetByName("Replace");

  var googleFormsColumnName = "Name";
  var googleFormsColumnFormId = "Form Id";
  var googleFormsColumnActive = "Active";

  var dataHeaderGoogleForms = Utility.getHearderData(sheetGoogleForms);
  var dataWithoutHeaderGoogleForms = Utility.getDataWithoutHeader(sheetGoogleForms);
  var jsonGoogleForms = Utility.formatDataToJson(dataHeaderGoogleForms,dataWithoutHeaderGoogleForms);

  var replaceColumnOldText = "Old Text";
  var replaceColumnNewText = "New Text";

  var dataHeaderReplace = Utility.getHearderData(sheetReplace);
  var dataWithoutHeaderReplace = Utility.getDataWithoutHeader(sheetReplace);
  var jsonReplace = Utility.formatDataToJson(dataHeaderReplace,dataWithoutHeaderReplace);


  jsonGoogleForms.forEach(function(row){
    var searchableItemQueue = [];

    var formName = row[googleFormsColumnName];
    var formId = row[googleFormsColumnFormId];
    var formActive = row[googleFormsColumnActive] === 1;

    if(formActive) {
      Logger.log("Processing Form " +  formName);
      var form = FormApp.openById(formId);

      var items = form.getItems();
      var factory = new Factory();

      Logger.log("" + formId + " " + items.length + " items");

      var searchableItem = new SearchableFormItem(form);
      searchableItemQueue.push(searchableItem);

      //populate queue
      items.forEach(function(item){
        var searchableItem = factory.getSearchableItem(item);
        if(searchableItem !== null) {
          searchableItemQueue.push(searchableItem);
        }
      });

      //process queue
      searchableItemQueue.forEach(function(searchableItem, index){
        var key =  "" +  formId + "[" + index.toString()  + "]";
        var value = cache.get(key);
        if(value === null) {
          Logger.log(key);
          jsonReplace.forEach(function(row){
            searchableItem.replaceAll(row[replaceColumnOldText], row[replaceColumnNewText]);
          });
          cache.put(key, 'true');
        }
      });
    }
  });
}

function clearCache(){
  //cache to bypass the Maximum execution time
  var cache = CacheService.getScriptCache();

  var keys = [];

  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheetGoogleForms = spreadSheet.getSheetByName("Google Forms");

  var googleFormsColumnName = "Name";
  var googleFormsColumnFormId = "Form Id";
  var googleFormsColumnActive = "Active";

  var dataHeaderGoogleForms = Utility.getHearderData(sheetGoogleForms);
  var dataWithoutHeaderGoogleForms = Utility.getDataWithoutHeader(sheetGoogleForms);
  var jsonGoogleForms = Utility.formatDataToJson(dataHeaderGoogleForms,dataWithoutHeaderGoogleForms);


  jsonGoogleForms.forEach(function(row){
    var searchableItemQueue = [];

    var formName = row[googleFormsColumnName];
    var formId = row[googleFormsColumnFormId];
    var formActive = row[googleFormsColumnActive] === 1;

    if(formActive) {
      Logger.log("Processing Form " +  formName);
      var form = FormApp.openById(formId);
      var items = form.getItems();
      var factory = new Factory();

      Logger.log("" + formId + " " + items.length + " items");
      searchableItemQueue.push(null);

      //populate queue
      items.forEach(function(item){
        searchableItemQueue.push(item);
      });

      //process queue
      searchableItemQueue.forEach(function(searchableItem, index){
        var key =  "" +  formId + "[" + index.toString()  + "]";
        keys.push(key);        
      });

      cache.removeAll(keys);
    }
  });
}

function getText() {
  //cache to bypass the Maximum execution time
  var cache = CacheService.getScriptCache();

  var spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheetGoogleForms = spreadSheet.getSheetByName("Google Forms");
  var sheetConfig = spreadSheet.getSheetByName("Config");

  var googleFormsColumnName = "Name";
  var googleFormsColumnFormId = "Form Id";
  var googleFormsColumnActive = "Active";

  var dataHeaderGoogleForms = Utility.getHearderData(sheetGoogleForms);
  var dataWithoutHeaderGoogleForms = Utility.getDataWithoutHeader(sheetGoogleForms);
  var jsonGoogleForms = Utility.formatDataToJson(dataHeaderGoogleForms,dataWithoutHeaderGoogleForms);

  var configColumnOutputFolder = "Output Folder";
  var configColumnOutputDescription = "Description";

  var dataHeaderConfig = Utility.getHearderData(sheetConfig);
  var dataWithoutHeaderConfig = Utility.getDataWithoutHeader(sheetConfig);
  var jsonConfig = Utility.formatDataToJson(dataHeaderConfig,dataWithoutHeaderConfig);

  var outputFolder  = jsonConfig[0][configColumnOutputFolder];
  var folder = DriveApp.getFolderById(outputFolder);

  jsonGoogleForms.forEach(function(row){
    var searchableItemQueue = [];

    var formName = row[googleFormsColumnName];
    var formId = row[googleFormsColumnFormId];
    var formActive = row[googleFormsColumnActive] === 1;

    if(formActive) {
      Logger.log("Processing Form " +  formName);
      var form = FormApp.openById(formId);

      var items = form.getItems();
      var factory = new Factory();

      Logger.log("" + formId + " " + items.length + " items");

      var searchableItem = new SearchableFormItem(form);
      searchableItemQueue.push(searchableItem);

      //populate queue
      items.forEach(function(item){
        var searchableItem = factory.getSearchableItem(item);
        if(searchableItem !== null) {
          searchableItemQueue.push(searchableItem);
        }
      });


      var output = [];
      
      

      //process queue
      searchableItemQueue.forEach(function(searchableItem, index){
        var key =  "" +  formId + "[" + index.toString()  + "]";
        var value = cache.get(key);
        if(value === null) {
          Logger.log(key);
          var texts = searchableItem.getText();
          output.push(texts.join("\n"));
          cache.put(key, 'true');
        }
      });

      var file = folder.createFile(formName,output.join("\n"),MimeType.PLAIN_TEXT);
    }
  });
}


class Factory {
  getSearchableItem(item) {
    var searchableItem = null;
    var type = item.getType();
    var name = type.toString();
    //Logger.log(name);

    switch (type) {
      case FormApp.ItemType.IMAGE:
        searchableItem = new SearchableImageItem(item);
        break;
      case FormApp.ItemType.PAGE_BREAK:
        searchableItem = new SearchableSectionItem(item);
        break;
      case FormApp.ItemType.SECTION_HEADER:
        searchableItem = new SearchableTextItem(item);
        break;
      case FormApp.ItemType.TEXT:
        searchableItem = new SearchableQuestionShortAnswerItem(item);
        break;
      case FormApp.ItemType.MULTIPLE_CHOICE:
        searchableItem = new SearchableQuestionMultipleChoiceItem(item);
        break;                
    }

    return searchableItem;
  }
}

class SearchableFormItem {
  constructor(form) {
    this.form = form;
  }

  replaceAll(oldText, newText) {
    var src = this.form.getConfirmationMessage();
    var dst = Utility.replaceAll(src,oldText, newText);
    if(src !== dst) {
      this.form.setConfirmationMessage(dst);
    }

    src = this.form.getCustomClosedFormMessage();
    dst = Utility.replaceAll(src,oldText, newText);
    if(src !== dst) {
    this.form.setCustomClosedFormMessage(dst);
    }

    src = this.form.getTitle();
    dst = Utility.replaceAll(src,oldText, newText);
    if(src !== dst) {
      this.form.setTitle(dst);
    }

    src = this.form.getDescription();
    dst = Utility.replaceAll(src,oldText, newText);
    if(src !== dst) {
      this.form.setDescription(dst);
    }
  }

  getText(){
    var output = [];
    output.push(this.form.getTitle());
    output.push(this.form.getDescription());
    return output;
  }
}

class SearchableSectionItem {
  constructor(item) {
    this.item = item;
  }

  replaceAll(oldText, newText) {
    var src = this.item.getTitle();
    var dst = Utility.replaceAll(src,oldText, newText);
    if(src !== dst) {
    this.item.setTitle(dst);
    }

    src = this.item.getHelpText();
    dst = Utility.replaceAll(src,oldText, newText);
    if(src !== dst) {
      this.item.setHelpText(dst);
    }
  }

  getText(){
    var output = [];
    output.push(this.item.getTitle());
    output.push(this.item.getHelpText());
    return output;
  }
}

class SearchableImageItem {
  constructor(item) {
    this.item = item;
  }

  replaceAll(oldText, newText) {
    var src = this.item.getTitle();
    var dst = Utility.replaceAll(src,oldText, newText);
    if(src !== dst) {
      this.item.setTitle(dst);
    }

    src = this.item.getHelpText();
    dst = Utility.replaceAll(src,oldText, newText);
    if(src !== dst) {
      this.item.setHelpText(dst);
    }
  }

  getText(){
    var output = [];
    output.push(this.item.getTitle());
    output.push(this.item.getHelpText());
    return output;
  }
}

class SearchableTextItem {
  constructor(item) {
    this.item = item;
  }

  replaceAll(oldText, newText) {
    var src = this.item.getTitle();
    var dst = Utility.replaceAll(src,oldText, newText);
     if(src !== dst) {
    this.item.setTitle(dst);
     }

    src = this.item.getHelpText();
    dst = Utility.replaceAll(src,oldText, newText);
    if(src !== dst) {
      this.item.setHelpText(dst);
    }
  }

  getText(){
    var output = [];
    output.push(this.item.getTitle());
    output.push(this.item.getHelpText());
    return output;
  }
}

class SearchableQuestionShortAnswerItem {
  constructor(item) {
    this.item = item;
  }

  replaceAll(oldText, newText) {
    var src = this.item.getTitle();
    var dst = Utility.replaceAll(src,oldText, newText);
    if(src !== dst) {
      this.item.setTitle(dst);
    }
  }

  getText(){
    var output = [];
    output.push(this.item.getTitle());
    return output;
  }
}

class SearchableQuestionMultipleChoiceItem {
  constructor(item) {
    this.item = item;
  }

  replaceAll(oldText, newText) {
    var src = this.item.getTitle();
    var dst = Utility.replaceAll(src,oldText, newText);
    if(src !== dst) {
      this.item.setTitle(dst);
    }
  }

  getText(){
    var output = [];
    output.push(this.item.getTitle());
    return output;
  }
}