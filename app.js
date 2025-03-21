let productList = [];
let totalPrice = 0;
let remaining = 0;
let productNames = JSON.parse(localStorage.getItem('productNames')) ;
let shopNames = JSON.parse(localStorage.getItem('shopNames')) ;
let historyListData = JSON.parse(localStorage.getItem('historyList')) || [];

// Update product and shop datalist
updateDataList('product-list-input', productNames);
updateDataList('shop-list-input', shopNames);

// Update datalist from local storage
function loadHistory() {
  // Get the instant payment value and remaining amount
  
  const historyList = document.getElementById('history-list');
  historyList.innerHTML = ''; // Clear the existing history

  // Sort historyListData based on the timestamp
  historyListData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  historyListData.forEach(historyEntry => {
      const newHistoryItem = document.createElement('li');
      const historyTable = document.createElement('table');
      historyTable.classList.add('history-table');

      // Build the history table
      historyTable.innerHTML = `
          <thead>
              <tr>
                  <th>Product Name</th>
                  <th>Shop Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total Price</th>
              </tr>
          </thead>
          <tbody></tbody>
      `;

      const tbody = historyTable.querySelector('tbody');
      historyEntry.products.forEach(product => {
          const row = document.createElement('tr');
          row.innerHTML = `
              <td>${product.productName}</td>
              <td>${product.shopName}</td>
              <td>${product.quantity}</td>
              <td>${product.price.toFixed(2)}</td>
              <td>${product.total.toFixed(2)}</td>
          `;
          tbody.appendChild(row);
      });

      // Append total row
      const totalRow = document.createElement('tr');
      totalRow.innerHTML = `
          <td style="text-align:right; font-weight:bold;">Paid amount:</td>
          <td style="font-weight:bold; color:red;">${historyEntry.instantPayValue.toFixed(2)}</td>
          <td colspan="2" style="text-align:right; font-weight:bold;">Total:</td>
          <td colspan="2" style="font-weight:bold; color:black;">${historyEntry.totalPrice.toFixed(2)}</td>
      `;
      tbody.appendChild(totalRow);
      
      
      // Calculate the remaining after payment
      const remaining = historyEntry.totalPrice - historyEntry.instantPayValue; // Calculate remaining
      
      // Append remaining row
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
          <td colspan="3" style="text-align:center;">Remaining After Payment:</td>
          <td colspan="2" style="font-weight:bold; color:black;">${remaining.toFixed(2)}</td>
      `;
      tbody.appendChild(newRow);

      // Add the table to the list item
      newHistoryItem.appendChild(historyTable);

      // Add timestamp to the history entry
      const timestamp = document.createElement('div');
      timestamp.classList.add('timestamp');
      timestamp.innerText = `Submitted on: ${historyEntry.timestamp}`;
      newHistoryItem.appendChild(timestamp);

      // Add a delete button
      const deleteButton = document.createElement('button');
      deleteButton.innerText = 'Delete';
      deleteButton.id='delete';
      deleteButton.classList.add('delete-history-btn');
      deleteButton.onclick = function() {
        deleteHistoryEntry(historyListData.indexOf(historyEntry));
     };
     
      newHistoryItem.appendChild(deleteButton);


      historyList.appendChild(newHistoryItem);
  });
}

// Call loadHistory when the page loads
loadHistory();


// Initialize product and shop lists
updateDataList('product-list-input', productNames);
updateDataList('shop-list-input', shopNames);

// Load history from local storage


function addProduct() {
  const productNameInput = document.getElementById('product-name').value.trim();
  const shopNameInput = document.getElementById('shop-name').value.trim();
  const quantity = parseFloat(document.getElementById('quantity').value);
  const price = parseFloat(document.getElementById('price').value);
  
  const total = quantity * price; // Original total calculation
  
  // Validate inputs
  if (!productNameInput || !shopNameInput || isNaN(quantity) || isNaN(price) || quantity <= 0 || price <= 0) {
      alert("Please fill in all fields correctly.");
      return;
  }

  let productNames = JSON.parse(localStorage.getItem('productNames')) || [];
  let shopNames = JSON.parse(localStorage.getItem('shopNames')) || [];
  // Check for new product and shop names, and store them
  if (!productNames.includes(productNameInput)) {
      productNames.push(productNameInput);
      updateDataList('product-list-input', productNames);
      localStorage.setItem('productNames', JSON.stringify(productNames));
  }

  if (!shopNames.includes(shopNameInput)) {
      shopNames.push(shopNameInput);
      updateDataList('shop-list-input', shopNames);
      localStorage.setItem('shopNames', JSON.stringify(shopNames));
  }

  // Create new product entry with correct total
  const newProduct = {
      productName: productNameInput,
      shopName: shopNameInput,
      quantity,
      price,
      total
  };

  // Add the product to the list and update localStorage
  productList.push(newProduct);
  localStorage.setItem('productList', JSON.stringify(productList));

  updateProductList(); // Refresh the product list
  updateTotal(); // Update total color based on Instant Pay
}

function submitCalculation() {
  const currentDate = new Date().toLocaleString();
  const instantPayValue = parseFloat(document.getElementById('instant').value) || 0;
  
  // Save current product list and total price to history
  const historyEntry = {
    timestamp: currentDate,
    totalPrice,
    instantPayValue,
    products: [...productList] // Deep copy of productList
  };
  

  historyListData.push(historyEntry);
  localStorage.setItem('historyList', JSON.stringify(historyListData));

  // Add the new history entry to the page
  loadHistory();

  // Clear product list and reset total
  totalPrice=0;
  productList = [];
  reset();
  

  document.getElementById('total-price').innerText = '0.00'; // Reset total price
    document.getElementById('remaining').innerText = '0.00';   // Reset remaining amount

}

function reset(){
  document.getElementById("product-Name").value='';
  document.getElementById("shop-name").value='';
  document.getElementById("quantity").value='';
  document.getElementById("price").value='';
  document.getElementById("instant").value='';
  
  const productListElement=document.getElementById('product-list');
  productListElement.innerHTML='';
  totalPrice = 0;
  
  productList=[];

}

function editProduct(index) {
  const product = productList[index];
  document.getElementById('product-name').value = product.productName;
  document.getElementById('shop-name').value = product.shopName;
  document.getElementById('quantity').value = product.quantity;
  document.getElementById('price').value = product.price;
  productList.splice(index, 1); 
  updateProductList();
}

function deleteProduct(index) {
  productList.splice(index, 1); 
  updateProductList();
}
function sortHistory() {
  const sortCriteria = document.getElementById('sort-criteria').value;

  if (sortCriteria === 'date-newest') {
    historyListData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } else if (sortCriteria === 'date-oldest') {
    historyListData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  } else if (sortCriteria === 'price-asc') {
    historyListData.sort((a, b) => a.totalPrice - b.totalPrice);
  } else if (sortCriteria === 'price-desc') {
    historyListData.sort((a, b) => b.totalPrice - a.totalPrice);
  }

  // Re-render the sorted history list
  loadHistory();

  // Update localStorage with sorted history
  localStorage.setItem('historyList', JSON.stringify(historyListData));
}
function updateProductList() {
  const productListTable = document.getElementById('product-list');
  productListTable.innerHTML = ''; // Clear existing table content
  totalPrice = 0;
  productList.forEach((product, index) => {
      
      const borrowed = product.total < 0 ? `<span style="color:red;">${Math.abs(product.total).toFixed(2)} Borrowed</span>` : '';
      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${product.productName}</td>
          <td>${product.shopName}</td>
          <td>${product.quantity}</td>
          <td>${product.price.toFixed(2)}</td>
          
          <td>${product.total.toFixed(2)} ${borrowed}</td>
         <td>
              <button class="edit-button" onclick="editProduct(${index})">Edit</button>
              <button class="delete-button" onclick="deleteProduct(${index})">Delete</button>
          </td>
      `;
      productListTable.appendChild(row);
      totalPrice +=product.total
      
  });
  
  document.getElementById('total-price').innerText = productList.reduce((acc, product) => acc + product.total, 0).toFixed(2);
}
function clearHistory() {
  // Confirm before clearing the history
  const confirmation = confirm("Are you sure you want to clear all history?");
  if (confirmation) {
      // Clear the history data from localStorage
      historyListData = [];  // Empty the history list data array
      localStorage.removeItem('historyList');  // Remove from localStorage

      // Clear the displayed history
      const historyListElement = document.getElementById('history-list');
      historyListElement.innerHTML = '';  // Clear the history display

      alert("History has been cleared.");
  }
}



// Assume 'totalAmount' is the total value, 'instantPay' is the value entered for instant pay,
// and 'remaining' is where we want to show the remaining amount.

function updateRemaining() {
  const instantPayValue = parseFloat(document.getElementById('instant').value) || 0;
  console.log("Instant Pay Value:", instantPayValue);
  const totalValue = parseFloat(document.getElementById('total-price').innerText) || 0;
  console.log("Total Value:", totalValue);
  const remaining = totalValue - instantPayValue; // Calculate the remaining amount
  console.log("Remaining Amount:", remaining);
  // Display remaining
  document.getElementById('remaining').innerText = remaining.toFixed(2);

  // Change color if remaining is negative
  if (remaining < 0) {
      document.getElementById('remaining').style.color = "red"; // Set text color to red
  } else {
      document.getElementById('remaining').style.color = "white"; // Set text color to black
  }
}

// Add event listener to the instant pay input field
document.getElementById('instant').addEventListener('input', updateRemaining);

function updateDataList(id, dataListArray) {
  const dataList = document.getElementById(id);
  dataList.innerHTML = ''; // Clear existing options

  // Populate new options from the array
  dataListArray.forEach(item => {
      const option = document.createElement('option');
      option.value = item;
      dataList.appendChild(option);
  });
}



function updateTotal() {
  let total = 0;

  // Calculate total based on products
  productList.forEach(product => {
      const productTotal = product.quantity * product.price;
      total += productTotal;
  });

  // Update total amount on the page
  document.getElementById('total-price').innerText = total.toFixed(2);

  // Recalculate remaining after instant pay deduction
  updateRemaining();
}
function deleteHistoryEntry(index) {
  if(historyListData && historyListData.length > index){
  
  // Remove the history entry from the array
  historyListData.splice(index, 1);

  // Update the local storage
  localStorage.setItem('historyList', JSON.stringify(historyListData));

  // Reload the history list
  loadHistory();
}else{
  console.error('error:invalid index',index);
}}
