export const invoiceTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice {{invoiceNumber}}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    body {
      font-family: 'Inter', sans-serif;
      color: #1f2937;
      margin: 0;
      padding: 0;
      background-color: white;
    }
    .print-bg {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    /* Watermark */
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 8rem;
      font-weight: 800;
      color: rgba(200, 200, 200, 0.15);
      z-index: 0;
      pointer-events: none;
      white-space: nowrap;
    }
    .watermark-PAID { color: rgba(34, 197, 94, 0.15); }
    .watermark-OVERDUE { color: rgba(239, 68, 68, 0.15); }
    .content-wrapper {
      position: relative;
      z-index: 10;
      padding: 40px;
    }
  </style>
</head>
<body class="bg-white">
  {{#if watermark}}
    <div class="watermark watermark-{{watermark}}">{{watermark}}</div>
  {{/if}}

  <div class="content-wrapper max-w-5xl mx-auto">
    
    <!-- Header Section -->
    <div class="flex justify-between items-start mb-10">
      <div>
        <h1 class="text-4xl font-bold text-slate-900 tracking-tight">{{company.name}}</h1>
        <div class="mt-3 text-sm text-slate-500 leading-relaxed">
          <p>{{company.address}}</p>
          {{#if company.phone}}<p>Phone: {{company.phone}}</p>{{/if}}
          {{#if company.email}}<p>Email: {{company.email}}</p>{{/if}}
          {{#if company.website}}<p>Web: {{company.website}}</p>{{/if}}
          {{#if company.taxId}}<p>Tax ID / EIN: {{company.taxId}}</p>{{/if}}
        </div>
      </div>
      <div class="text-right">
        <h2 class="text-4xl font-bold uppercase tracking-widest text-blue-600 mb-2">INVOICE</h2>
        <div class="inline-block bg-slate-50 print-bg p-4 rounded-lg border border-slate-100 text-sm">
          <table class="w-full text-right">
            <tbody>
              <tr>
                <td class="font-semibold text-slate-700 pr-4 pb-1">Invoice Number:</td>
                <td class="text-slate-900 pb-1">{{invoiceNumber}}</td>
              </tr>
              <tr>
                <td class="font-semibold text-slate-700 pr-4 pb-1">Invoice Date:</td>
                <td class="text-slate-900 pb-1">{{issueDate}}</td>
              </tr>
              <tr>
                <td class="font-semibold text-slate-700 pr-4 pb-1">Due Date:</td>
                <td class="text-slate-900 pb-1">{{dueDate}}</td>
              </tr>
              <tr>
                <td class="font-semibold text-slate-700 pr-4">Payment Terms:</td>
                <td class="text-slate-900">{{paymentTerms}}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-10 mb-10">
      <!-- Bill To -->
      <div>
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 border-b pb-2">Bill To</h3>
        <p class="font-semibold text-slate-900 text-lg">{{client.name}}</p>
        <div class="text-sm text-slate-600 mt-2 leading-relaxed">
          <p>{{client.address}}</p>
          {{#if client.email}}<p>Email: {{client.email}}</p>{{/if}}
          {{#if client.phone}}<p>Phone: {{client.phone}}</p>{{/if}}
        </div>
      </div>

      <!-- Consultant & Project Info -->
      <div>
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 border-b pb-2">Project Details</h3>
        <div class="grid grid-cols-2 gap-y-2 text-sm">
          <div class="font-semibold text-slate-700">Project:</div>
          <div class="text-slate-900">{{project.name}}</div>
          
          <div class="font-semibold text-slate-700">Consultant:</div>
          <div class="text-slate-900">{{consultant.name}}</div>
          
          {{#if vendor.name}}
          <div class="font-semibold text-slate-700">Vendor:</div>
          <div class="text-slate-900">{{vendor.name}}</div>
          {{/if}}

          <div class="font-semibold text-slate-700">Billing Period:</div>
          <div class="text-slate-900">{{billingPeriod}}</div>
        </div>
      </div>
    </div>

    <!-- Invoice Table -->
    <div class="mb-10">
      <table class="w-full text-sm text-left border-collapse">
        <thead class="bg-blue-50 text-blue-900 print-bg">
          <tr>
            <th class="py-3 px-4 font-semibold rounded-tl-lg">Description</th>
            <th class="py-3 px-4 font-semibold text-center">Consultant</th>
            <th class="py-3 px-4 font-semibold text-center">Hours</th>
            <th class="py-3 px-4 font-semibold text-right">Rate</th>
            <th class="py-3 px-4 font-semibold text-right rounded-tr-lg">Amount</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          {{#each lineItems}}
          <tr class="{{#if @even}}bg-white{{else}}bg-slate-50 print-bg{{/if}}">
            <td class="py-4 px-4 font-medium text-slate-900">{{this.description}}</td>
            <td class="py-4 px-4 text-center text-slate-600">{{this.consultantName}}</td>
            <td class="py-4 px-4 text-center text-slate-600">{{this.hours}}</td>
            <td class="py-4 px-4 text-right text-slate-600">{{this.rate}}</td>
            <td class="py-4 px-4 text-right text-slate-900 font-semibold">{{this.amount}}</td>
          </tr>
          {{/each}}
        </tbody>
      </table>
    </div>

    <!-- Totals Section -->
    <div class="flex justify-end mb-12">
      <div class="w-1/2">
        <table class="w-full text-sm">
          <tbody>
            <tr>
              <td class="py-2 text-slate-600 font-medium">Subtotal</td>
              <td class="py-2 text-right text-slate-900">{{totals.subtotal}}</td>
            </tr>
            {{#if totals.tax}}
            <tr>
              <td class="py-2 text-slate-600 font-medium">Tax</td>
              <td class="py-2 text-right text-slate-900">{{totals.tax}}</td>
            </tr>
            {{/if}}
            {{#if totals.discount}}
            <tr>
              <td class="py-2 text-slate-600 font-medium">Discount</td>
              <td class="py-2 text-right text-green-600">-{{totals.discount}}</td>
            </tr>
            {{/if}}
            <tr class="border-t-2 border-slate-900 border-b-2">
              <td class="py-3 text-lg font-bold text-slate-900">Total Due</td>
              <td class="py-3 text-lg font-bold text-blue-600 text-right">{{totals.total}} {{currency}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Payment Information -->
    <div class="mb-12 bg-slate-50 print-bg p-6 rounded-lg border border-slate-200">
      <h3 class="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b pb-2">Payment Details</h3>
      <div class="grid grid-cols-2 gap-y-3 text-sm">
        <div class="font-semibold text-slate-600">Bank Name:</div>
        <div class="text-slate-900">{{bank.name}}</div>
        
        <div class="font-semibold text-slate-600">Account Name:</div>
        <div class="text-slate-900">{{bank.accountName}}</div>
        
        <div class="font-semibold text-slate-600">Account Number:</div>
        <div class="text-slate-900">{{bank.accountNumber}}</div>
        
        <div class="font-semibold text-slate-600">Routing Number:</div>
        <div class="text-slate-900">{{bank.routingNumber}}</div>
        
        {{#if bank.swift}}
        <div class="font-semibold text-slate-600">SWIFT / IBAN:</div>
        <div class="text-slate-900">{{bank.swift}}</div>
        {{/if}}
      </div>
    </div>

    <!-- Terms & Conditions -->
    <div class="text-xs text-slate-500 mb-16">
      <h4 class="font-bold text-slate-700 uppercase mb-2">Terms & Conditions</h4>
      <ul class="list-disc pl-5 space-y-1">
        <li>Payment is due within {{paymentTerms}}.</li>
        <li>Late payments may incur additional charges.</li>
        <li>Please mention Invoice Number <strong>{{invoiceNumber}}</strong> while making payment.</li>
        <li>All disputes must be reported within 7 days of invoice generation.</li>
      </ul>
    </div>

    <!-- Footer -->
    <div class="border-t pt-8 text-center text-xs text-slate-400 mt-auto">
      <p class="font-semibold text-slate-500 mb-1">Thank you for your business!</p>
      <p>
        {{company.name}} | {{company.website}} | {{company.email}}<br>
        Generated on {{generatedAt}} | This is a computer generated invoice and does not require a physical signature.
      </p>
    </div>

  </div>
</body>
</html>
`;
