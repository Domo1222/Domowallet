// Display Current Date
// 1. I-load ang balance mula sa memory ng browser, o gamitin ang default na 24500
let currentBalance = parseFloat(localStorage.getItem('domowix_balance')) || 24500;

// 2. Function para i-update ang display sa screen
function updateBalanceDisplay() {
    document.getElementById('total-balance').innerText = `₱ ${currentBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
    localStorage.setItem('domowix_balance', currentBalance);
}

// 3. Tawagin ito agad pagload ng page
updateBalanceDisplay();

// 4. I-update ang Send Money function mo (Dagdagan mo ito sa loob ng transfer listener)
// Halimbawa: currentBalance -= amount; updateBalanceDisplay();
document.getElementById('current-date').innerText = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
});

// Transfer Logic
document.getElementById('transfer-form').addEventListener('submit', function (e) {
    e.preventDefault();
    
    const recipient = document.getElementById('recipient').value;
    const amount = parseFloat(document.getElementById('amount').value);

    // 1. Check kung may sapat na pera
    if (amount > currentBalance) {
        return alert("Ops! Kulang ang balance mo para dito.");
    }

    // 2. Bawasan ang balance
    currentBalance -= amount;

    // 3. I-update ang display sa screen (yung 24,500)
    updateBalanceDisplay();

    // 4. Idagdag sa transaction history
    addTransaction(recipient, amount, 'Transfer');

    alert(`Success! Na-send na ang ₱${amount.toLocaleString()} kay ${recipient}.`);
    this.reset();
});

// PayMongo Function Placeholder
function initiatePayment() {
    const amountToPay = prompt("Enter amount to Top Up (PHP):", "100");

    if (amountToPay) {
        alert("Connecting to PayMongo Gateway...");
        // Dito natin ilalagay yung Fetch API para sa PayMongo Checkout
        // Kailangan natin ng Public/Secret Key mo dito mamaya
        console.log(`Requesting payment for ${amountToPay}`);
    }
}

function fillContact(name) {
    document.getElementById('recipient').value = name;
}
// Function para magdagdag ng transaction sa table
function addTransaction(recipient, amount, type) {
    const tableBody = document.querySelector('.transaction-table tbody');
    const newRow = document.createElement('tr');
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    newRow.innerHTML = `
        <td>${date}</td>
        <td>${recipient}</td>
        <td>${type}</td>
        <td class="${type === 'Transfer' ? 'neg' : 'pos'}">${type === 'Transfer' ? '-' : '+'} ₱${parseFloat(amount).toLocaleString()}</td>
        <td><span class="status success">Completed</span></td>
    `;

    // Nilalagay sa pinakataas ng listahan
    tableBody.prepend(newRow);
}

// I-connect natin sa Transfer Form mo
document.getElementById('transfer-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const recipient = document.getElementById('recipient').value;
    const amount = document.getElementById('amount').value;

    addTransaction(recipient, amount, 'Transfer');
    alert(`Transfer to ${recipient} successful!`);
    this.reset();
});
const PAYMONGO_SECRET_KEY = 'sk_test_p66vwGeCsBLWZii4fWs6oZy9'; // Huwag ito ipakita sa iba!

async function initiatePayment() {
    const amountToPay = prompt("Magkano ang i-Top Up mo? (PHP):", "100");

    if (!amountToPay || isNaN(amountToPay)) return alert("Valid amount please!");

    // Convert to cents (PayMongo uses cents, so 100 PHP = 10000)
    const amountInCents = parseInt(amountToPay) * 100;

    const options = {
        method: 'POST',
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            authorization: `Basic ${btoa(sk_test_p66vwGeCsBLWZii4fWs6oZy9)}`
        },
        body: JSON.stringify({
            data: {
                attributes: {
                    send_email_receipt: true,
                    show_description: true,
                    show_line_items: true,
                    description: 'Domowix Wallet Top-up',
                    line_items: [{ amount: amountInCents, currency: 'PHP', name: 'Wallet Credits', quantity: 1 }],
                    payment_method_types: ['gcash', 'grab_pay', 'paymaya', 'card'],
                    success_url: window.location.href, // Babalik dito sa dashboard pag success
                    cancel_url: window.location.href
                }
            }
        })
    };

    try {
        const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', options);
        const json = await response.json();

        if (json.data.attributes.checkout_url) {
            // Redirect na sa PayMongo Checkout Page!
            window.location.href = json.data.attributes.checkout_url;
        }
    } catch (err) {
        console.error(err);
        alert("Ops, nag-error ang connection sa PayMongo.");
    }
}

// I-connect sa button
document.querySelector('li:nth-child(3)').addEventListener('click', initiatePayment);
