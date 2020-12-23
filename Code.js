function run() {
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
      searchableItemQueue.forEach(function(searchableItem){
        jsonReplace.forEach(function(row){
          searchableItem.replaceAll(row[replaceColumnOldText], row[replaceColumnNewText]);
        });
      });
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
}