import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import './InvoiceDetails.css';
import axios from "axios";
import html2canvas from "html2canvas"; // Import html2canvas
import jsPDF from "jspdf"; // Import jsPDF for PDF generation

const InvoiceDetails = () => {
  const location = useLocation();
  const [data, setData] = useState(location.state);
  const [user, setUser] = useState();
  const [isEditing, setIsEditing] = useState(false); // Track if we are in edit mode
  const [editableProducts, setEditableProducts] = useState(data.products);
  const logo = localStorage.getItem('image');

  // Function to toggle edit mode
  const toggleEditMode = (editMode) => {
    setIsEditing(editMode);
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(2);
    return `${day}/${month}/${year}`;
  };

  // Fetch user data
  useEffect(() => {
    const email = localStorage.getItem('email');
    const fetchUserData = async () => {
      try {
        const response = await axios.post('http://localhost:4000/api/user', { email });
        setUser(response.data.user);
      } catch (error) {
        alert("Internal Server Error");
      }
    };

    fetchUserData();
  }, []);

  // Function to generate PDF from HTML content using html2canvas
  const generatePDF = (customerName) => {

    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => button.style.display = 'none');
    
      const input=document.getElementById('invoice-content');

      html2canvas(input,{useCORS:true})
      .then((canvs)=>{
          const imageData=canvs.toDataURL('image/png',1.0)
          const pdf=new jsPDF({
              orientation:"portrait",
              unit:'pt',
              format:[612,792],
          })
          pdf.internal.scaleFactor=1;
          const imageProps=pdf.getImageProperties(imageData)
          const pdfWidth=pdf.internal.pageSize.getWidth()
          const pdfHeight=(imageProps.height*pdfWidth)/imageProps.width
          pdf.addImage(imageData,'PNG',0,0,pdfWidth,pdfHeight)
          pdf.save(customerName+' invoice')

          buttons.forEach(button => button.style.display = 'inline-block');
      })
  } 


  // Function to handle email sharing
  const handleEmailShare = () => {
    const subject = `Invoice ${data.invoiceId}`;
    const body = `Dear Customer,\n\nHere is your invoice: ${window.location.href}\n\nThank you for your business!`;
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // Function to handle WhatsApp sharing

  const convertPdfToBase64 = async (pdfFile) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(pdfFile);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

const handleWhatsAppShare = async (pdfFile, phoneNumber) => {
  try {
    const pdfData = await convertPdfToBase64(pdfFile);
    await axios.post('http://localhost:3000/api/sendPdf', {
      phoneNumber: phoneNumber,
      pdfData: pdfData,
      fileName: 'invoice',
    });
    alert('PDF sent successfully via WhatsApp!');
  } catch (error) {
    console.error('Error sending PDF:', error);
    alert('Failed to send PDF via WhatsApp');
  }
};

  return (
    <div className="invoice-container" id="invoice-content">
      {/* Header and User Details */}
      <div className="header-conatainer">
        <img src={logo} alt="company logo" />
        {user && (
          <div className="user-detail-container">
            <span className="userName">{user.name}</span> <br />
            <span className="address">{user.address}</span> <br />
            <span className="contact">{user.email} || +91 {user.phone}</span> <br />
          </div>
        )}
      </div>

      {/* Main Invoice Details */}
      <div className="main-detail-container">
        <div className="detail-container">
          <h4>Bill to: </h4>
          <span className="customer">Name : {data.to}</span> <br />
          <span className="customer">Address : {data.address}</span><br />
          <span className="customer">Phone No : +91 {data.phone}</span>
        </div>

        <div className="detail-container">
          <p>Invoice No.: {data.invoiceId} </p>
          <p>Date: {formatDate(data.date)}</p>
        </div>
      </div>

      {/* Invoice Content to be Captured for PDF */}
        <table className="product-table">
          <thead>
            <tr>
              <th>Sr.No</th>
              <th>Item</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {editableProducts.map((item, index) => {
              const srNo = index + 1;
              const price = parseFloat(item.price);
              const quantity = parseFloat(item.quantity);
              const total = price * quantity;
              return (
                <tr key={item.id}>
                  <td>{srNo}</td>
                  <td className="nameCap">
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                      />
                    ) : (
                      item.name
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleProductChange(index, 'price', e.target.value)}
                      />
                    ) : (
                      price
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                      />
                    ) : (
                      quantity
                    )}
                  </td>
                  <td>{total}</td>
                </tr>
              );
            })}
          </tbody>
          <tr>
            <td colSpan={4} style={{ textAlign: "center" }}>Total</td>
            <td>{data.total}</td>
          </tr>
        </table>

        {/* Footer */}
        <div className="invoice-main-footer">
          <p><b>Payment Terms:</b> Payment due within 30 days of invoice date.</p>
          <p><b>Late Fees:</b> A late fee of 1.5% per month will apply for overdue balances.</p>
          <p><b>Contact:</b> For questions regarding this invoice, please contact us at <a href="mailto:aimps24x7@gmail.com" style={{ color: 'blue' }}>
            aimps24x7@gmail.com
          </a></p>
          <p>Thank you for your business! We appreciate your prompt payment.</p>
        </div>

      {/* Actions */}
      <div className="actions-container">
  <button onClick={() => toggleEditMode(!isEditing)}>
    {isEditing ? "Save Changes" : "Edit Invoice"}
  </button>
  <button onClick={() => generatePDF(data.to)}>Download PDF</button>
  <button onClick={handleEmailShare}>Share via Email</button>
  <button onClick={handleWhatsAppShare}>Share via WhatsApp</button>
</div>

    </div>
  );
};

export default InvoiceDetails;
