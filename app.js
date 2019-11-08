//Budget controller
var budgetController = (function() {
  var Expense = function(id, description, amount) {
    this.id = id;
    this.description = description;
    this.amount = amount;
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
    incomeList: ".income-item",
    expenseList: ".expense-item",
    income: ".income-value",
    expense: ".expense-value",
    budget: ".budget-value",
    percent: ".percent-value"
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

    //add item to ui
    addNewItem: function(obj, type) {
      var htmlString, element;

      //create html
      if (type === "inc") {
        element = DOMStrings.incomeList;
        htmlString = `<div class="item">
              <p>${obj.description}</p>
              <p class="text--green">${obj.amount}</p>
            </div>`;
      } else {
        element = DOMStrings.expenseList;

        htmlString = `<div class="item">
            <p>${obj.description}</p>
            <p class="text--red">${obj.amount}</p>
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
      document.querySelector(DOMStrings.income).textContent = obj.totalIncome;
      document.querySelector(DOMStrings.expense).textContent = obj.totalExpense;
      document.querySelector(DOMStrings.budget).textContent = obj.budget;
      if (obj.percentage > 0)
        document.querySelector(DOMStrings.percent).textContent =
          obj.percentage + "%";
      else document.querySelector(DOMStrings.percent).textContent = "-";
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
      // 5. update ui
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
    }
  };
})(budgetController, UIController);

controller.init();
