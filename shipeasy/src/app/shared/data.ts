

export const shared = {
  headerNotification: [
    { title: "Your order is placed", des: "Dummy text of the printing and typesetting industry." },
    { title: "Your order is placed", des: "Dummy text of the printing and typesetting industry." },
    { title: "Your order is placed", des: "Dummy text of the printing and typesetting industry." },
  ],
  pdaTabs: [
    { name: "PDA Template List", id: "pdatemplates-tab", control: "pdatemplates", status: 0, key: "pdatemplates" },
    { name: "PDA Cost Item", id: "costitem-tab", control: "costitem", status: 0, key: "costitem" },
  ],
  newpdatemplateData: [
    { name: "Post Services", type: "Loading", cost_head: "Loading", unit: "25", qty: "4500", description: "XYZ" },
    { name: "Post Services", type: "Loading", cost_head: "Loading", unit: "25", qty: "4500", description: "XYZ" },
    { name: "Post Services", type: "Loading", cost_head: "Loading", unit: "25", qty: "4500", description: "XYZ" },
    { name: "Post Services", type: "Loading", cost_head: "Loading", unit: "25", qty: "4500", description: "XYZ" },
    { name: "Post Services", type: "Loading", cost_head: "Loading", unit: "25", qty: "4500", description: "XYZ" },

  ],
  newvoyage: [
    { terminal_id: "27-02-2022", voyage_id: "27-02-2022", sequence: "27-02-2022" },
  ],
    userRoleRowData: [
    { id: 1, terminal_id: "27-02-2022", voyage_id: "27-02-2022", sequence: "27-02-2022", },
    { id: 2, terminal_id: "27-02-2022", voyage_id: "27-02-2022", sequence: "27-02-2022", },
    { id: 3, terminal_id: "27-02-2022", voyage_id: "27-02-2022", sequence: "27-02-2022", },
    { id: 4, terminal_id: "27-02-2022", voyage_id: "27-02-2022", sequence: "27-02-2022", },
  ],
  settingData: [
    { name: "Settings", status: "true" },
    { name: "Terms and Engagement", status: "true" },
    { name: "Notes", status: "true" },
    { name: "Profile", status: "true" },
    { name: "Transfer Portcall", status: "true" },
    { name: "Select Bank", status: "true" },
    { name: "Submit DA", status: "true" },
    { name: "Preferences", status: "true" },
    { name: "Log of Events", status: "true" },
    { name: "Add New Payment", status: "true" },
    { name: "Share PCS", status: "true" },
    { name: "Company Details", status: "true" },
    { name: "Create Portcall", status: "true" },
    { name: "Appoint Field Agent", status: "true" },
    { name: "Portcall Handled Report", status: "true" },
    { name: "Port Details", status: "true" },
    { name: "Cancel Portcall", status: "true" },
    { name: "Split Cost", status: "true" },
    { name: "PDA Summary", status: "true" },
    { name: "Offering & Corgo Handled", status: "true" },
    { name: "Reject Portcall", status: "true" },
    { name: "Email SOF", status: "true" },
    { name: "IDA Summary", status: "true" },
  ],
  masterTabs: [
    { name: "Port Service", id: "prot-tab", control: "prot", status: 0, key: "prot" },
  ],
  chargeRow: [
    { id: 1, group: "Line Charges", name: " Freight", term: "PREPARE INCLUDE", currency: "USD",  payableAt: "23.22", amount: "2,500,00", jmbamount: "2,500,00", gst: "4455555", total_amount: "344444" },
    { id: 2, group: "Doc Charges", name: "Do Fees", term: "PREPARE EXCLUDE", currency: "USD",  payableAt: "23.22", amount: "2,500,00", jmbamount: "2,500,00", gst: "4455555", total_amount: "344444" },
    { id: 3, group: "Deport Chrges", name: "AGENT freight", term: "COLLECT", currency: "USD",  payableAt: "23.22", amount: "2,500,00", jmbamount: "2,500,00", gst: "4455555", total_amount: "344444" },
    { id: 4, group: "freight", name: "AGENT freight", term: "PREPARE INCLUDE", currency: "USD", payableAt: "23.22", amount: "2,500,00", jmbamount: "2,500,00", gst: "4455555", total_amount: "344444" },
    { id: 5, group: "freight", name: "AGENT freight", term: "PREPARE EXCLUDE", currency: "USD", payableAt: "23.22", amount: "2,500,00", jmbamount: "2,500,00", gst: "4455555", total_amount: "344444" },
    { id: 6, group: "freight", name: "AGENT freight", term: "COLLECT", currency: "USD", payableAt: "23.22", amount: "2,500,00", jmbamount: "2,500,00", gst: "4455555", total_amount: "344444" },
    { id: 7, group: "freight", name: "AGENT freight", term: "PREPARE INCLUDE", currency: "USD", payableAt: "23.22", amount: "2,500,00", jmbamount: "2,500,00", gst: "4455555", total_amount: "344444" },
  ],
  
  chargeRows: [
    { id: 1, point: "Line Charges", date: " 01-04-2022", fromUser: "abc", toUser: "abc", status: "success",remarks:"abc" },
    { id: 2, point: "Line Charges", date: " 01-04-2022", fromUser: "abc", toUser: "abc", status: "success",remarks:"abc" },
    { id: 3, point: "Line Charges", date: " 01-04-2022", fromUser: "abc", toUser: "abc", status: "success",remarks:"abc" },
    { id: 4, point: "Line Charges", date: " 01-04-2022", fromUser: "abc", toUser: "abc", status: "success",remarks:"abc" },
    { id: 5, point: "Line Charges", date: " 01-04-2022", fromUser: "abc", toUser: "abc", status: "success",remarks:"abc" },
 
  ],
  contactRow: [
    {
      principalName: "Sun Pharma Industries",
      ContactType: "Head Office ",
      ContactName: "Anand Rathi",
      ContactPhone: "+91 9081302999",
      ContactEmail: "josridge@green.us.com",
      id: 1
    },
    {
      principalName: "Rajesh Exports",
      ContactType: "Branch Office ",
      ContactName: "Tushar Pawar",
      ContactPhone: "+91 9081302999",
      ContactEmail: "josridge@green.us.com",
      id: 2
    },
    {
      principalName: "Sun Pharma Industries",
      ContactType: "Head Office ",
      ContactName: "Anand Rathi",
      ContactPhone: "+91 9081302999",
      ContactEmail: "josridge@green.us.com",
      id: 3
    },
    {
      principalName: "Rajesh Exports",
      ContactType: "Branch Office ",
      ContactName: "Tushar Pawar",
      ContactPhone: "+91 9081302999",
      ContactEmail: "josridge@green.us.com",
      id: 4
    },
    {
      principalName: "Sun Pharma Industries",
      ContactType: "Head Office ",
      ContactName: "Anand Rathi",
      ContactPhone: "+91 9081302999",
      ContactEmail: "josridge@green.us.com",
      id: 5
    },
    {
      principalName: "Rajesh Exports",
      ContactType: "Branch Office ",
      ContactName: "Tushar Pawar",
      ContactPhone: "+91 9081302999",
      ContactEmail: "josridge@green.us.com",
      id: 6
    },
    {
      principalName: "Sun Pharma Industries",
      ContactType: "Head Office ",
      ContactName: "Anand Rathi",
      ContactPhone: "+91 9081302999",
      ContactEmail: "josridge@green.us.com",
      id: 7
    },
    {
      principalName: "Rajesh Exports",
      ContactType: "Branch Office ",
      ContactName: "Tushar Pawar",
      ContactPhone: "+91 9081302999",
      ContactEmail: "josridge@green.us.com",
      id: 8
    },
    {
      principalName: "Sun Pharma Industries",
      ContactType: "Head Office ",
      ContactName: "Anand Rathi",
      ContactPhone: "+91 9081302999",
      ContactEmail: "josridge@green.us.com",
      id: 9
    },
    {
      principalName: "Rajesh Exports",
      ContactType: "Branch Office ",
      ContactName: "Tushar Pawar",
      ContactPhone: "+91 9081302999",
      ContactEmail: "josridge@green.us.com",
      id: 10
    },

  ],

  AgreementRow: [
    {
      AgreementName: "Nhava Sheva Agreement",
      Port: "Nhava Sheva ",
      CityCountry: "Mumbai,India",
      StartDate: "15-01-22",
      EndDate: "15-01-22",
    },
    {
      AgreementName: "Port Of Mundra Agreement",
      Port: "Port Of Mundra ",
      CityCountry: "kutch,India",
      StartDate: "15-01-22",
      EndDate: "15-01-22",
    },
    {
      AgreementName: "Port of Kolkata Agreement",
      Port: "Port of Kolkata ",
      CityCountry: "Chennai,India",
      StartDate: "15-01-22",
      EndDate: "15-01-22",
    },
    {
      AgreementName: "Nhava Sheva Agreement",
      Port: "Nhava Sheva ",
      CityCountry: "Mumbai,India",
      StartDate: "15-01-22",
      EndDate: "15-01-22",
    },
    {
      AgreementName: "Port Of Mundra Agreement",
      Port: "Port Of Mundra ",
      CityCountry: "kutch,India",
      StartDate: "15-01-22",
      EndDate: "15-01-22",
    },
    {
      AgreementName: "Port of Kolkata Agreement",
      Port: "Port of Kolkata ",
      CityCountry: "Chennai,India",
      StartDate: "15-01-22",
      EndDate: "15-01-22",
    },
    {
      AgreementName: "Nhava Sheva Agreement",
      Port: "Nhava Sheva ",
      CityCountry: "Mumbai,India",
      StartDate: "15-01-22",
      EndDate: "15-01-22",
    },
    {
      AgreementName: "Port Of Mundra Agreement",
      Port: "Port Of Mundra ",
      CityCountry: "kutch,India",
      StartDate: "15-01-22",
      EndDate: "15-01-22",
    },
    {
      AgreementName: "Port of Kolkata Agreement",
      Port: "Port of Kolkata ",
      CityCountry: "Chennai,India",
      StartDate: "15-01-22",
      EndDate: "15-01-22",
    },
    {
      AgreementName: "Nhava Sheva Agreement",
      Port: "Nhava Sheva ",
      CityCountry: "Mumbai,India",
      StartDate: "15-01-22",
      EndDate: "15-01-22",
    },

  ],
  clauseRow: [
    {
      ClausesName: "Nhava Sheva Agreement",
      StartDate: "15-01-22",
      EndDate: "15-01-22",
      Remarks: "Advance received against this PDA will be...",
    },
    {
      ClausesName: "Port Of Mundra Agreement",
      StartDate: "15-01-22",
      EndDate: "15-01-22",
      Remarks: "Advance received against this PDA will be...",
    },
    {
      ClausesName: "Port of Kolkata Agreement",
      StartDate: "15-01-22",
      EndDate: "15-01-22",
      Remarks: "Advance received against this PDA will be...",
    },
    {
      ClausesName: "Nhava Sheva Agreement",
      StartDate: "15-01-22",
      EndDate: "15-01-22",
      Remarks: "Advance received against this PDA will be...",
    },
    {
      ClausesName: "Port Of Mundra Agreement",
      StartDate: "15-01-22",
      EndDate: "15-01-22",
      Remarks: "Advance received against this PDA will be...",
    },
    {
      ClausesName: "Port of Kolkata Agreement",
      StartDate: "15-01-22",
      EndDate: "15-01-22",
      Remarks: "Advance received against this PDA will be...",
    },

    {
      ClausesName: "Nhava Sheva Agreement",
      StartDate: "15-01-22",
      EndDate: "15-01-22",
      Remarks: "Advance received against this PDA will be...",
    },
    {
      ClausesName: "Port Of Mundra Agreement",
      StartDate: "15-01-22",
      EndDate: "15-01-22",
      Remarks: "Advance received against this PDA will be...",
    },
    {
      ClausesName: "Port of Kolkata Agreement",
      StartDate: "15-01-22",
      EndDate: "15-01-22",
      Remarks: "Advance received against this PDA will be...",
    },
    {
      ClausesName: "Port of Kolkata Agreement",
      StartDate: "15-01-22",
      EndDate: "15-01-22",
      Remarks: "Advance received against this PDA will be...",
    },

  ],

  HolidayRow: [
    {
      HolidayName: "Martin Luther King Jr. Day",
      Country: "United States",
      Date: "Mon,17 Jan",
      Year: "22",

    },
    {
      HolidayName: "Memorial Day",
      Country: "United States",
      Date: "Mon,17 Jan",
      Year: "22",

    },
    {
      HolidayName: "Independence Day",
      Country: "United States",
      Date: "Mon,17 Jan",
      Year: "22",

    },
    {
      HolidayName: "Labor Day",
      Country: "United States",
      Date: "Mon,17 Jan",
      Year: "22",

    },
    {
      HolidayName: "Veterans Day",
      Country: "United States",
      Date: "Mon,17 Jan",
      Year: "22",

    },
  ],
  invoiceRow: [
    { id: "1", number: "HO/IM/2122/D0687", date: "02-JUN-2021", due_date: "01-03-2022", invoice_to: "Global Logistic Pvt LTd", amount: "930.00", status: "FCL/FCL" },
    { id: "2", number: "HO/IM/2122/D0687", date: "02-JUN-2021", due_date: "01-03-2022", invoice_to: "Global Logistic Pvt LTd", amount: "930.00", status: "FCL/FCL" },
    { id: "3", number: "HO/IM/2122/D0687", date: "02-JUN-2021", due_date: "01-03-2022", invoice_to: "Global Logistic Pvt LTd", amount: "930.00", status: "FCL/FCL" },
    { id: "4", number: "HO/IM/2122/D0687", date: "02-JUN-2021", due_date: "01-03-2022", invoice_to: "Global Logistic Pvt LTd", amount: "930.00", status: "FCL/FCL" },
    { id: "5", number: "HO/IM/2122/D0687", date: "02-JUN-2021", due_date: "01-03-2022", invoice_to: "Global Logistic Pvt LTd", amount: "930.00", status: "FCL/FCL" },
    
  ],
  documentRow: [
    { type: "PDA", name: "Document-1", date: "23-12-22", last_updated: "A K Ojha" },
    { type: "PDA", name: "Document-1", date: "23-12-22", last_updated: "A K Ojha" },
    { type: "PDA", name: "Document-1", date: "23-12-22", last_updated: "A K Ojha" },
  ],
  discussionRow: [
    {
      id: "1", bl_no: "Batch",
      disc: "Lorem ipsum dolor sit amet consectetur, adipisicing elit.", name: "punit Sing", date_time: "25-01-2022 18:40",
    },
    {
      id: "2", bl_no: "Enquiry",
      disc: "Lorem ipsum dolor sit amet consectetur, adipisicing elit.", name: "punit Sing", date_time: "25-01-2022 18:40",
    },
    {
      id: "3", bl_no: "Batch",
      disc: "Lorem ipsum dolor sit amet consectetur, adipisicing elit.", name: "punit Sing", date_time: "25-01-2022 18:40",
    },
    {
      id: "3", bl_no: "Batch",
      disc: "Lorem ipsum dolor sit amet consectetur, adipisicing elit.", name: "punit Sing", date_time: "25-01-2022 18:40",
    }, {
      id: "3", bl_no: "Batch",
      disc: "Lorem ipsum dolor sit amet consectetur, adipisicing elit.", name: "punit Sing", date_time: "25-01-2022 18:40",
    }, {
      id: "3", bl_no: "Batch",
      disc: "Lorem ipsum dolor sit amet consectetur, adipisicing elit.", name: "punit Sing", date_time: "25-01-2022 18:40",
    },
  ],
  branchRow: [
    {
      branch: "Nhava Sheva Branch",
      CityCountry: "Mumbai,India ",
      PortServices: "Jawaharial Nehru Port Trust",
      twentyfourno: "+91 9081302999",
      id: 1

    },
    {
      branch: "Port of Mundra Kutch",
      CityCountry: "Kutch,India",
      PortServices: "Port of Mundra",
      twentyfourno: "+91 9081302999",
      id: 2
    },
    {
      branch: "Kolkata Branch",
      CityCountry: "Kolkata, India",
      PortServices: "Syama Prasad Mookerjee Port Trust",
      twentyfourno: "+91 9081302999",
      id: 3

    },
    {
      branch: "Nhava Sheva Branch",
      CityCountry: "Mumbai,India ",
      PortServices: "Jawaharial Nehru Port Trust",
      twentyfourno: "+91 9081302999",
      id: 4

    },
    {
      branch: "Port of Mundra Kutch",
      CityCountry: "Kutch,India",
      PortServices: "Port of Mundra",
      twentyfourno: "+91 9081302999",
      id: 5
    },
    {
      branch: "Kolkata Branch",
      CityCountry: "Kolkata, India",
      PortServices: "Syama Prasad Mookerjee Port Trust",
      twentyfourno: "+91 9081302999",
      id: 6

    },
    {
      branch: "Nhava Sheva Branch",
      CityCountry: "Mumbai,India ",
      PortServices: "Jawaharial Nehru Port Trust",
      twentyfourno: "+91 9081302999",
      id: 7

    },
    {
      branch: "Port of Mundra Kutch",
      CityCountry: "Kutch,India",
      PortServices: "Port of Mundra",
      twentyfourno: "+91 9081302999",
      id: 8
    },
    {
      branch: "Kolkata Branch",
      CityCountry: "Kolkata, India",
      PortServices: "Syama Prasad Mookerjee Port Trust",
      twentyfourno: "+91 9081302999",
      id: 9
    },
    {
      branch: "Nhava Sheva Branch",
      CityCountry: "Mumbai,India ",
      PortServices: "Jawaharial Nehru Port Trust",
      twentyfourno: "+91 9081302999",
      id: 10
    },
  ],
  allInvoicesData: [
    {  charge_group: "Loading at Port", charge_name: "EXPRESS GLOBAL LOGISTICS PVT LTD", hsn_code: "996711",per_unit_amount:"3,000.00",currency:"INR", charge_amout: "930.00", sac_code: "996711",igst:"540.00", tax_amount: "12481.34", bill_amount: "$23" },
    {  charge_group: "Loading at Port", charge_name: "EXPRESS GLOBAL LOGISTICS PVT LTD", hsn_code: "996711",per_unit_amount:"3,000.00",currency:"INR", charge_amout: "930.00", sac_code: "996711",igst:"540.00", tax_amount: "12481.34", bill_amount: "$23" },
  ],
  paymentRow: [
    {recieptNo:1,date:'15/07/2022',job:50,p_name:'Rutvik Mangukiya',dep:'All Port',details:'Here is Details',r_ref_no:1020,currency:'INR',i_amt:50000,a_in_inr:50000,status:'Paid'},
    {recieptNo:2,date:'17/06/2022',job:20,p_name:'Jenish Bhesnoya',dep:'All Port',details:'Here is Details',r_ref_no:1020,currency:'INR',i_amt:50000,a_in_inr:50000,status:'Paid'},
    {recieptNo:3,date:'11/07/2022',job:89,p_name:'Jay Gangani',dep:'All Port',details:'Here is Details',r_ref_no:1020,currency:'INR',i_amt:50000,a_in_inr:50000,status:'Paid'}
  ],
  newpaymentRow: [
    { batch_no: "HO/SC/2021/A6845", invoice_no: "HO/SC/2021/A6845", invoice_date: "01-03-22", due_date: "10-03-22", invoice_to: "GLOBAL LOGISTICS PVT", amount: "$4,80,000", payment_amount: "$4,80,000" },
    { batch_no: "HO/SC/2021/A6845", invoice_no: "HO/SC/2021/A6845", invoice_date: "10-03-22", due_date: "15-03-22", invoice_to: "EXPRESS GLOBAL PVT", amount: "$6,602,99", payment_amount: "$6,602,99" },
    { batch_no: "HO/SC/2021/A6845", invoice_no: "HO/SC/2021/A6845", invoice_date: "25-03-22", due_date: "18-03-22", invoice_to: "UNITED GLOBAL PVT", amount: "$15000", payment_amount: "$15000" },
  ],
  billRow: [
    { id: "1", bill_no: "HO/SC/2021/A6845", bill_date: "01-03-22", bill_due_date: "10-03-22", vendor_name: "GLOBAL LOGISTICS PVT", amount: "$ 4,80,000", status: "Completed" },
    { id: "1", bill_no: "HO/SC/2021/A6845", bill_date: "10-03-22", bill_due_date: "15-03-22", vendor_name: "EXPRESS GLOBAL PVT", amount: "$ 6,602.99", status: "Paid" },
    { id: "1", bill_no: "HO/SC/2021/A6845", bill_date: "25-03-22", bill_due_date: "18-03-22", vendor_name: "UNITED GLOBAL PVT", amount: "$ 15000", status: "Processed" },
  ],
  newbillRow: [
    { id: "1", batch_no: "123456789012", cost_group: "Port Charges", service_date: "18-12-22", remarks: "This service is delivered..", container_number: "1234567890", cost_amount: "$500", bill_amount: "$500" },
    { id: "2", batch_no: "123456789012", cost_group: "Custom Charges", service_date: "18-12-22", remarks: "This service is delivered..", container_number: "1234567890", cost_amount: "$241", bill_amount: "$130" },
    { id: "3", batch_no: "123456789012", cost_group: "Port Charges", service_date: "18-12-22", remarks: "This service is delivered..", container_number: "1234567890", cost_amount: "$114", bill_amount: "$40" },
    { id: "4", batch_no: "123456789012", cost_group: "Port Charges", service_date: "18-12-22", remarks: "This service is delivered..", container_number: "1234567890", cost_amount: "$60", bill_amount: "$25" },
  ],
  creditRow: [
    { id: "1", credit_no: "234555", credit_to: "Erika Shipping", date: "23-02-22", batch_no: "PC-344444444", amount: "13000", tax_amount: "34000", total_amount: "$230" },
    { id: "2", credit_no: "234555", credit_to: "Erika Shipping", date: "23-02-22", batch_no: "PC-344444444", amount: "13000", tax_amount: "34000", total_amount: "$230" },
    { id: "3", credit_no: "234555", credit_to: "Erika Shipping", date: "23-02-22", batch_no: "PC-344444444", amount: "13000", tax_amount: "34000", total_amount: "$230" },
    { id: "4", credit_no: "234555", credit_to: "Erika Shipping", date: "23-02-22", batch_no: "PC-344444444", amount: "13000", tax_amount: "34000", total_amount: "$230" },
    { id: "5", credit_no: "234555", credit_to: "Erika Shipping", date: "23-02-22", batch_no: "PC-344444444", amount: "13000", tax_amount: "34000", total_amount: "$230" },
    { id: "6", credit_no: "234555", credit_to: "Erika Shipping", date: "23-02-22", batch_no: "PC-344444444", amount: "13000", tax_amount: "34000", total_amount: "$230" },
  ],
  allBillData: [
    { batch_no: "HO/SC/2021/HFG456H", invoice_no: "HO/SC/2021/HFG456H", invoice_date: "01-02-22", charge_item: "Port Service", remark: "Global logistic pvt ltd", invoice_amount: "48,000", payment_amount: "340000" },
    { batch_no: "HO/SC/2021/HFG456H", invoice_no: "HO/SC/2021/HFG456H", invoice_date: "01-02-22", charge_item: "Port Service", remark: "Global logistic pvt ltd", invoice_amount: "48,000", payment_amount: "340000" },
  ],
  debitRow: [
    { id: "1", debit_no: "234555", debit_to: "Erika Shipping", date: "23-02-22", batch_no: "PC-344444444", amount: "13000", tax_amount: "34000", total_amount: "$230" },
    { id: "2", debit_no: "234555", debit_to: "Erika Shipping", date: "23-02-22", batch_no: "PC-344444444", amount: "13000", tax_amount: "34000", total_amount: "$230" },
    { id: "3", debit_no: "234555", debit_to: "Erika Shipping", date: "23-02-22", batch_no: "PC-344444444", amount: "13000", tax_amount: "34000", total_amount: "$230" },
    { id: "4", debit_no: "234555", debit_to: "Erika Shipping", date: "23-02-22", batch_no: "PC-344444444", amount: "13000", tax_amount: "34000", total_amount: "$230" },
    { id: "5", debit_no: "234555", debit_to: "Erika Shipping", date: "23-02-22", batch_no: "PC-344444444", amount: "13000", tax_amount: "34000", total_amount: "$230" },
    { id: "6", debit_no: "234555", debit_to: "Erika Shipping", date: "23-02-22", batch_no: "PC-344444444", amount: "13000", tax_amount: "34000", total_amount: "$230" },
  ],
  pnlRow: [
    { cost_group: "Berthing", cost_item: "Berthing", status: "pending", estimate: "110", cost: "103", vendor_bill: "120", invoice: "12", pending: "0" },
    { cost_group: "Berthing", cost_item: "Berthing", status: "pending", estimate: "110", cost: "103", vendor_bill: "120", invoice: "12", pending: "0" },
    { cost_group: "Berthing", cost_item: "Berthing", status: "pending", estimate: "110", cost: "103", vendor_bill: "120", invoice: "12", pending: "0" },
    { cost_group: "Berthing", cost_item: "Berthing", status: "pending", estimate: "110", cost: "103", vendor_bill: "120", invoice: "12", pending: "0" },
    { cost_group: "Berthing", cost_item: "Berthing", status: "pending", estimate: "110", cost: "103", vendor_bill: "120", invoice: "12", pending: "0" },
    { cost_group: "Berthing", cost_item: "Berthing", status: "pending", estimate: "110", cost: "103", vendor_bill: "120", invoice: "12", pending: "0" },
    { cost_group: "Berthing", cost_item: "Berthing", status: "pending", estimate: "110", cost: "103", vendor_bill: "120", invoice: "12", pending: "0" },
  ],
  enquiryCost: [
    {
      id: "1",
      cost_group: "Cost Group-01", cost_items: "LNR GCost Items-01", sub_active: "terminal", terminal: "Terminal-2", berth: "5", port_time: "24:30", cargo_details: "3 Cargo 1 File"
    },
    {
      id: "2",
      cost_group: "Cost Group-01", cost_items: "LNR GCost Items-01", sub_active: "terminal", terminal: "Terminal-2", berth: "5", port_time: "24:30", cargo_details: "3 Cargo 1 File"
    },
    {
      id: "3",
      cost_group: "Cost Group-01", cost_items: "LNR GCost Items-01", sub_active: "terminal", terminal: "Terminal-2", berth: "5", port_time: "24:30", cargo_details: "3 Cargo 1 File"
    }

  ],
  jobCost: [
    { id: 1, chargename: "Loading", vesselunit: "GRT:4591", unit: "Per Call", zero: "Y", currency: "USD", excrate: "74.07", qty: 1, rateunit: "0.4769", amtinfC: "0.4769", amtininr: "16.2172", gst: "0.4769" },
    { id: 2, chargename: "Discharge", vesselunit: "GRT:4591", unit: "Per Call", zero: "Y", currency: "USD", excrate: "74.07", qty: 2, rateunit: "0.4869", amtinfC: "0.4769", amtininr: "16.2172", gst: "0.4769" },
    { id: 3, chargename: "Port Service", vesselunit: "GRT:4591", unit: "Per Call", zero: "Y", currency: "USD", excrate: "74.07", qty: 3, rateunit: "0.4969", amtinfC: "0.4769", amtininr: "16.2172", gst: "0.4769" },
  ],

 
  pdaRow: [
    {
      id: "1",
      pda: "Invoice Documents", date: "25-12-2022 16:30", cost: "4,80,000", price: "5,00,000", status: "Sent for Approval"
    }
  ],
  addpdaRow: [
    {
      id: "1",
      cost_group: "Cost Group-01", cost_items: "Cost Items-01", terminal: "Terminal 01", berth: "13SQ1C 18:23", currency: "USD", price: "5,00,000"
    },
    {
      id: "1",
      cost_group: "Cost Group-01", cost_items: "Cost Items-01", terminal: "Terminal 01", berth: "13SQ1C 18:23", currency: "USD", price: "5,00,000"
    },
    {
      id: "1",
      cost_group: "Cost Group-01", cost_items: "Cost Items-01", terminal: "Terminal 01", berth: "13SQ1C 18:23", currency: "USD", price: "5,00,000"
    },
    {
      id: "1",
      cost_group: "Cost Group-01", cost_items: "Cost Items-01", terminal: "Terminal 01", berth: "13SQ1C 18:23", currency: "USD", price: "5,00,000"
    },
    {
      id: "1",
      cost_group: "Cost Group-01", cost_items: "Cost Items-01", terminal: "Terminal 01", berth: "13SQ1C 18:23", currency: "USD", price: "5,00,000"
    },
    {
      id: "1",
      cost_group: "Cost Group-01", cost_items: "Cost Items-01", terminal: "Terminal 01", berth: "13SQ1C 18:23", currency: "USD", price: "5,00,000"
    }, {
      id: "1",
      cost_group: "Cost Group-01", cost_items: "Cost Items-01", terminal: "Terminal 01", berth: "13SQ1C 18:23", currency: "USD", price: "5,00,000"
    }
  ],
  checkListRow: [
    { type: "Batch", name: "BL Uploaded", approvedby: "Jon", ata: "20-12-22 15:20", status: "Pending", remark: "Lorem Ipsum is simply dummy text of the printing" },
    { type: "Batch", name: "IGM Created", approvedby: "ketan", ata: "20-12-22 15:20", status: "Pending", remark: "Lorem Ipsum is simply dummy text of the printing" },
    { type: "Batch", name: "Tank Allocated", approvedby: "parmesh", ata: "20-12-22 15:20", status: "Completed", remark: "Lorem Ipsum is simply dummy text of the printing" },
    { type: "Batch", name: "BL Uploaded", approvedby: "avile", ata: "20-12-22 15:20", status: "Pending", remark: "Lorem Ipsum is simply dummy text of the printing" },
    { type: "Batch", name: "BL Uploaded", approvedby: "Jon", ata: "20-12-22 15:20", status: "Pending", remark: "Lorem Ipsum is simply dummy text of the printing" },
    { type: "Batch", name: "BL Uploaded", approvedby: "Jon", ata: "20-12-22 15:20", status: "Pending", remark: "Lorem Ipsum is simply dummy text of the printing" },
  ],
  chargelist:[
    {shipper_name:"KLJ PLASTICIZERS LIMITED",container_type:"TK20",container_size:"20",por:"GREENOCK, U.K",load_place:"Dumbarton,GBDBT",entry_port:"Nhava Sheva,INNSA",ts_port:"",on_carriage:"ICD DADRI",effective_from:"14-JUN-2021",effective_to:"31-MAR-2022"}
  ],
  freightlist:[
    {shipping_line:"CMA CGM INDIA PVT LTD",charge_name:"FREIGHT",freight_term:"P",currency:"US DOLLAR",place_payable:"Mumbai",tax:"5",stc:"5000",jmb:""},
  ],
  opsChargeList:[
    {charges:"PRESSURE GUAGES",amount_code:"123",vendor_code:"456",amount:"750",charge_term:"PREPAID INCLUDE",gst:"18",stc_amount:"885",jmb_amount:""},
    {charges:"OCEAN FREIGHT",amount_code:"123",vendor_code:"456",amount:"987",charge_term:"PREPAID INCLUDE",gst:"0",stc_amount:"987",jmb_amount:""},
    {charges:"THC CHARGES",amount_code:"123",vendor_code:"456",amount:"6000",charge_term:"PREPAID EXCLUDE",gst:"0",stc_amount:"6000",jmb_amount:""},
    {charges:"AGENCY FEES LOADED EXPORT",amount_code:"123",vendor_code:"75",amount:"750",charge_term:"PREPAID INCLUDE",gst:"0",stc_amount:"75",jmb_amount:""},
    {charges:"TDS ON BEHALF OF HTC",amount_code:"123",vendor_code:"456",amount:"2.5",charge_term:"COLLECT INCLUDE",gst:"0",stc_amount:"2.5",jmb_amount:""},
    {charges:"BILL OF LADING CHARGES",amount_code:"123",vendor_code:"456",amount:"2600",charge_term:"COLLECT EXCLUDE",gst:"0",stc_amount:"2600",jmb_amount:""}, 
  ],
  batchcheckListRow: [
    { name: "Batch list", status: "true" },
    { name: "Batch Terms ", status: "true" },
    { name: " Notes", status: "true" },
    { name: "Batch Profile", status: "true" },
    { name: "Transfer", status: "true" },
    { name: " Portcall", status: "true" },
    { name: " Portcall", status: "true" },
    { name: " Portcall", status: "true" },
  ],
  vendorBillRow: [
    { id: 1, bill_no: "HO/SC/2021/A566T", date: "01-02-22", due_date: "04-02-22", vendor_name: "Global Logistic Pvt Ltd", amount: "$7548484", status: "Completed" },
    { id: 2, bill_no: "HO/SC/2021/A566T", date: "01-02-22", due_date: "04-02-22", vendor_name: "Global Logistic Pvt Ltd", amount: "$7548484", status: "Completed" },
    { id: 3, bill_no: "HO/SC/2021/A566T", date: "01-02-22", due_date: "04-02-22", vendor_name: "Global Logistic Pvt Ltd", amount: "$7548484", status: "Completed" },
    { id: 4, bill_no: "HO/SC/2021/A566T", date: "01-02-22", due_date: "04-02-22", vendor_name: "Global Logistic Pvt Ltd", amount: "$7548484", status: "Completed" },
    { id: 5, bill_no: "HO/SC/2021/A566T", date: "01-02-22", due_date: "04-02-22", vendor_name: "Global Logistic Pvt Ltd", amount: "$7548484", status: "Completed" },
    { id: 6, bill_no: "HO/SC/2021/A566T", date: "01-02-22", due_date: "04-02-22", vendor_name: "Global Logistic Pvt Ltd", amount: "$7548484", status: "Completed" },
  ],
  allBillsData: [
    { batch_no: "E-000123/21-22", cost_group: "Port Charges", cost_itme: "Berthing", services_date: "18-12-22", remark: "this service is delivered", container_no: "UTCU4841198", cost_amount: "$23", bill_amount: "$23" },
    { batch_no: "E-000123/21-22", cost_group: "Port Charges", cost_itme: "Berthing", services_date: "18-12-22", remark: "this service is delivered", container_no: "UTCU4841198", cost_amount: "$23", bill_amount: "$23" },
  ],
  blRow: [
    { id: 1, bl_no: "HO/SC/2021/A566T", bl_type: "Original", shipper: "MITSUYA BOEKI LTD 2-2-7KYUTARO MACHI,CHUO-KU OSAKA,JAPAN 541-0056", consignee: "TO THE ORDER OF RBL BANK LIMITED", voyage: "048S", pol: "KOBE SEA PORT IN JAPAN", status: "Approved" },
    { id: 2, bl_no: "HO/SC/2021/A566T", bl_type: "Original", shipper: "MITSUYA BOEKI LTD 2-2-7KYUTARO MACHI,CHUO-KU OSAKA,JAPAN 541-0056", consignee: "TO THE ORDER OF RBL BANK LIMITED", voyage: "048S", pol: "KOBE SEA PORT IN JAPAN", status: "Approved" },
    { id: 3, bl_no: "HO/SC/2021/A566T", bl_type: "Original", shipper: "MITSUYA BOEKI LTD 2-2-7KYUTARO MACHI,CHUO-KU OSAKA,JAPAN 541-0056", consignee: "TO THE ORDER OF RBL BANK LIMITED", voyage: "048S", pol: "KOBE SEA PORT IN JAPAN", status: "Approved" },
    { id: 4, bl_no: "HO/SC/2021/A566T", bl_type: "Original", shipper: "MITSUYA BOEKI LTD 2-2-7KYUTARO MACHI,CHUO-KU OSAKA,JAPAN 541-0056", consignee: "TO THE ORDER OF RBL BANK LIMITED", voyage: "048S", pol: "KOBE SEA PORT IN JAPAN", status: "Approved" },
    { id: 5, bl_no: "HO/SC/2021/A566T", bl_type: "Original", shipper: "MITSUYA BOEKI LTD 2-2-7KYUTARO MACHI,CHUO-KU OSAKA,JAPAN 541-0056", consignee: "TO THE ORDER OF RBL BANK LIMITED", voyage: "048S", pol: "KOBE SEA PORT IN JAPAN", status: "Approved" },
    { id: 6, bl_no: "HO/SC/2021/A566T", bl_type: "Original", shipper: "MITSUYA BOEKI LTD 2-2-7KYUTARO MACHI,CHUO-KU OSAKA,JAPAN 541-0056", consignee: "TO THE ORDER OF RBL BANK LIMITED", voyage: "048S", pol: "KOBE SEA PORT IN JAPAN", status: "Approved" },
   
  ],
  containerBillsData: [
    { seq_no:"11223",container_no:"UTCU462670-2",marks_nos: "LAXMI ORGANIC INDUSTRIES LTD NHAVA SHEVA 2-HYDROXYETHYL METHACRYLATE MITSUBISHI GAS CHEMICAL COMPANY INC COUNTRY OF ORIGIN:JAPAN",agent_seal_no:"55782", no_of_pkgs: "1 X 20TK",pkg_type:"aaa",tare_wt: "3730.000 Kgs",net_wt:"20080.000 Kgs", gross_wt: "23810.000 Kgs",wt_unit:"10",  cbm: "25.000 CBM",shipping_bill_no:"3254435",shipping_bill_date:"09-05-2022", doc_compl_date: "09-06-2022" },
    { seq_no:"11223",container_no:"UTCU462670-2",marks_nos: "LAXMI ORGANIC INDUSTRIES LTD NHAVA SHEVA 2-HYDROXYETHYL METHACRYLATE MITSUBISHI GAS CHEMICAL COMPANY INC COUNTRY OF ORIGIN:JAPAN",agent_seal_no:"55782", no_of_pkgs: "1 X 20TK",pkg_type:"aaa",tare_wt: "3730.000 Kgs",net_wt:"20080.000 Kgs", gross_wt: "23810.000 Kgs",wt_unit:"10",  cbm: "25.000 CBM",shipping_bill_no:"3254435",shipping_bill_date:"09-05-2022", doc_compl_date: "09-06-2022" },
  ],
  tankRow: [
    { id: "1", no: "EXFU5546946",type: "TK20", weight: "1000KG", corgo_type: "HAZ", bl_no: "124566", shipping_bil: "957548383", do: "44444", sob: "Pending",voyage:"0EH9KE1MA", bond_no: "56644",  status: "Booked" },
    { id: "2", no: "EXFU5550036", type: "TK20", weight: "1000KG", corgo_type: "HAZ", bl_no: "124566", shipping_bil: "957548383", do: "44444", sob: "Pending",voyage:"0EH9KE1MA", bond_no: "56644",  status: "Booked" },
    { id: "3", no: "EXFU5580940", type: "TK20", weight: "1000KG", corgo_type: "HAZ", bl_no: "124566", shipping_bil: "957548383", do: "44444", sob: "Pending",voyage:"0EH9KE1MA", bond_no: "56644",  status: "Booked" },
    { id: "4", no: "EXFU8956543", type: "TK20", weight: "1000KG", corgo_type: "HAZ", bl_no: "124566", shipping_bil: "957548383", do: "44444", sob: "Pending",voyage:"0EH9KE1MA", bond_no: "56644",  status: "Booked" },
    { id: "5", no: "UTCU4674716", type: "TK20", weight: "1000KG", corgo_type: "HAZ", bl_no: "124566", shipping_bil: "957548383", do: "44444", sob: "Pending",voyage:"0EH9KE1MA", bond_no: "56644",  status: "Booked" },
  
  ],
  innerContainerData: [
    { no: "45677766555", type: "TK20", corgo_type: "Container Corgo" },
    { no: "45677766555", type: "TK20", corgo_type: "Container Corgo" },
    { no: "45677766555", type: "TK20", corgo_type: "Container Corgo" },
    { no: "45677766555", type: "TK20", corgo_type: "Container Corgo" }
  ],
 
};