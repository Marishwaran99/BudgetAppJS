//Budget controller
var budgetController = (function() {
  var Expense = function(id, description, amount) {
    this.id = id;
    this.description = description;
    this.amount = amount;
    this.percentage = -1;
  };

  Expense.prototype.calculatePercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.amount / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };
  var Income = function(id, description, amount) {
    this.id = id;
    this.description = description;
    this.amount = amount;
  };

  //calculate total
  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(item => {
      sum += item.amount;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };
  return {
    addItem: function(type, description, amount) {
      var item, ID;

      //creating id
      if (data.allItems[type].length > 0)
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      else ID = 0;

      //create expense item or income item
      if (type === "exp") item = new Expense(ID, description, amount);
      else item = new Income(ID, description, amount);

      //pushing data to exp list and return the item
      data.allItems[type].push(item);
      return item;
    },

    deleteItem: function(type, id) {
      var ids, index;
      ids = data.allItems[type].map(curr => {
        return curr.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) data.allItems[type].splice(index, 1);
    },
    display: function() {
      console.log(data);
    },

    //calculaet budget
    calculateBudget: function() {
      //calculate total
      calculateTotal("exp");
      calculateTotal("inc");

      //calculate budget income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      //calculate expense percentage
      if (data.totals.inc > 0)
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      else data.percentage = -1;
    },

    //calculate percentages
    calculatePercentages: function() {
      data.allItems.exp.forEach(curr => {
        curr.calculatePercentage(data.totals.inc);
      });
    },

    getPercentages: function() {
      var allPercent = data.allItems.exp.map(curr => {
        return curr.getPercentage();
      });
      return allPercent;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalIncome: data.totals.inc,
        totalExpense: data.totals.exp,
        percentage: data.percentage
      };
    }
  };
})();

//UIContrroller
var UIController = (function() {
  var DOMStrings = {
    inputType: ".type",
    inputDesc: ".description",
    inputAmount: ".amount",
    inputBtn: ".check-btn",
    checkSymbol: ".tick-symbol",
    incomeList: ".income-item",
    expenseList: ".expense-item",
    income: ".income-value",
    expense: ".expense-value",
    budget: ".budget-value",
    percent: ".percent-value",
    percentLabel: ".percent-label",
    close: ".close-icon",
    incExpList: ".income-expense-list"
  };
  return {
    //Get input values
    getInput: function() {
      return {
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputDesc).value,
        amount: parseFloat(document.querySelector(DOMStrings.inputAmount).value)
      };
    },

    //Get DOM Strings
    getDOMStrings: function() {
      return DOMStrings;
    },

    //delete item
    deleteListItem: function(selectorId) {
      var el = document.getElementById(selectorId);
      console.log(el);
      el.parentNode.removeChild(el);
    },

    //add item to ui
    addNewItem: function(obj, type) {
      var htmlString, element;

      //create html
      if (type === "inc") {
        element = DOMStrings.incomeList;
        htmlString = `<div class="item" id=inc-${obj.id}>
        <p>${obj.description}</p>
        <div class="value-container">
          <p class="text--green">${obj.amount}</p>
          <button class="text--green close-icon">&#10006;</button>
        </div>
      </div>`;
      } else {
        element = DOMStrings.expenseList;

        htmlString = `<div class="item" id=exp-${obj.id}>
        <p>${obj.description}</p>
        <div class="value-container">
          <p class="text--red">${obj.amount}</p>
          <p class="percent-value percent-label">${obj.percentage}</p>
          <button class="text--red close-icon">&#10006;</button>
        </div>
      </div>`;
      }

      //Inserting into html
      document
        .querySelector(element)
        .insertAdjacentHTML("beforeend", htmlString);
    },

    //clear inputs
    clearFields: function() {
      document.querySelector(DOMStrings.inputAmount).value = "";
      document.querySelector(DOMStrings.inputDesc).value = "";
    },

    //display budget
    displayBudget: function(obj) {
      document.querySelector(DOMStrings.income).textContent =
        "+ " + this.formatNumber(obj.totalIncome);
      document.querySelector(DOMStrings.expense).textContent =
        "- " + this.formatNumber(obj.totalExpense);
      document.querySelector(DOMStrings.budget).textContent = this.formatNumber(
        obj.budget
      );
      if (obj.percentage > 0)
        document.querySelector(DOMStrings.percent).textContent =
          obj.percentage + "%";
      else document.querySelector(DOMStrings.percent).textContent = "-";
    },
    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMStrings.percentLabel);
      var nodesForEach = function(list, callback) {
        for (let i = 0; i < list.length; i++) {
          callback(list[i], i);
        }
      };
      nodesForEach(fields, function(current, index) {
        if (percentages[index] > 0)
          current.textContent = percentages[index] + "%";
        else current.textContent = "-";
      });
    },
    displayMonth: function() {
      var now, year, month;
      now = new Date();

      year = now.getFullYear();
      month = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      month = month[now.getMonth()];

      document.querySelector(".month").textContent = month + " " + year;
    },
    formatNumber: function(num) {
      var splitnum, int, dec;
      num = Math.abs(num);

      num = num.toFixed(2);

      splitnum = num.split(".");
      int = splitnum[0];
      dec = splitnum[1];
      return int.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "." + dec;
    },
    changedType: function() {
      var fields = document.querySelectorAll(
        DOMStrings.inputType +
          "," +
          DOMStrings.inputDesc +
          "," +
          DOMStrings.inputAmount +
          "," +
          DOMStrings.checkSymbol
      );
      fields.forEach(function(field) {
        field.classList.toggle("green");
        field.classList.toggle("red");
      });
    }
  };
})();

//controller
var controller = (function(budgetCtrl, UICtrl) {
  var setUpEventListeners = function() {
    var DOMStrings = UICtrl.getDOMStrings();
    document
      .querySelector(DOMStrings.inputBtn)
      .addEventListener("click", ctrlAddItem);

    document
      .querySelector("#description")
      .addEventListener("keypress", function(e) {
        if (e.which === 13 || e.keyCode === 13) {
          ctrlAddItem();
        }
      });
    document
      .querySelector(DOMStrings.incExpList)
      .addEventListener("click", ctrlDeleteItem);

    document
      .querySelector(DOMStrings.inputType)
      .addEventListener("change", UICtrl.changedType);
  };
  //update percentages

  var updatePercentage = function() {
    //calcuate percentage
    budgetCtrl.calculatePercentages();

    //get percentage
    var percentages = budgetController.getPercentages();

    //display
    UICtrl.displayPercentages(percentages);
  };
  //update budget
  var updateBudget = function() {
    //calculate budget
    budgetCtrl.calculateBudget();

    //store the budget value
    var budget = budgetCtrl.getBudget();
    console.log(budget);

    //add budget to ui
    UICtrl.displayBudget(budget);
  };

  var ctrlAddItem = function() {
    //variable declaration
    var input, newItem;

    // 1. GEt the input field value
    input = UICtrl.getInput();
    console.log(input);

    if (input.description !== "" && !isNaN(input.amount) && input.amount > 0) {
      // 2. add item to the budget controller
      newItem = budgetController.addItem(
        input.type,
        input.description,
        input.amount
      );
      console.log(newItem);

      // 3. add item to ui
      UICtrl.addNewItem(newItem, input.type);

      //4 clear input
      UICtrl.clearFields();

      // 5. calculate budget
      updateBudget();

      // 5. update percentages
      updatePercentage();
    }
  };

  //delete item
  var ctrlDeleteItem = function(e) {
    var itemId, splitId, type, id;
    itemId = e.target.parentNode.parentNode.id;
    if (itemId) {
      splitId = itemId.split("-");
      type = splitId[0];
      id = parseInt(splitId[1]);

      //delete from list
      budgetCtrl.deleteItem(type, id);

      //delete from ui
      UICtrl.deleteListItem(itemId);

      //update budget
      updateBudget();
    }
  };
  return {
    init: function() {
      console.log("App started");
      UICtrl.displayBudget({
        budget: 0,
        totalIncome: 0,
        totalExpense: 0,
        percentage: 0
      });
      setUpEventListeners();
      UICtrl.displayMonth();
    }
  };
})(budgetController, UIController);

controller.init();
