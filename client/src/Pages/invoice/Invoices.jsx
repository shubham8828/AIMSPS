import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Invoice.css';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const Invoices = () => {
  const [allInvoices, setAllInvoices] = useState([]); // Holds all invoices
  const [filteredInvoices, setFilteredInvoices] = useState([]); // Holds filtered invoices
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const itemsPerPage = 10;

  // Fetch all invoices once from the backend
  const fetchInvoices = async () => {
    try {
      const email = localStorage.getItem('email');
      const response = await axios.post('https://aimsps-server.vercel.app/api/invoices', { email });
      const fetchedInvoices = response.data.invoices;
      
      // Sort invoices in LIFO order (most recent first)
      const sortedInvoices = fetchedInvoices.reverse();
      
      setAllInvoices(sortedInvoices);
      setFilteredInvoices(sortedInvoices); // Initially set filtered invoices to all invoices
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // Handle invoice deletion
  const deleteInvoice = async (id) => {
    try {
      await axios.delete(`https://aimsps-server.vercel.app/api/delete/${id}`)
        .then((res) => {
          toast.success(res.data.msg, { position: 'top-center' });
          setAllInvoices(allInvoices.filter(invoice => invoice._id !== id));
          setFilteredInvoices(filteredInvoices.filter(invoice => invoice._id !== id));
        });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error("Internal Server Error", { position: 'top-center' });
    }
  };

  // Filter invoices by name based on the search term
  useEffect(() => {
    const results = allInvoices.filter(invoice =>
      invoice.to.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInvoices(results);
    setCurrentPage(1); // Reset to first page when search term changes
  }, [searchTerm, allInvoices]);

  // Pagination: Get current page invoices
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInvoices = filteredInvoices.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  // Handle next page click
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prevPage) => prevPage + 1);
  };

  // Handle previous page click
  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((prevPage) => prevPage - 1);
  };

  return (
    <>
      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Search by Customer Name" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className='invoices-container'>
        {currentInvoices.length > 0 ? (
          currentInvoices.map((data) => {
            const [firstName] = data.to.split(' ');

            return (
              <div className="box" key={data._id}>
                <p>{firstName}</p>
                <p>{new Date(data.date).toLocaleDateString()}</p>
                <p>Rs. {data.total}</p>
                <button 
                  className="delete-btn"
                  onClick={() => deleteInvoice(data._id)}
                >
                  <i className="fa-solid fa-trash"></i> <p id='dbtn'>Delete</p>
                </button>
                <button
                  onClick={() => navigate("/invoice-details", { state: data })}
                  className="view-btn"
                >
                  <i className="fa-solid fa-eye"></i><p id='vbtn'>View</p>
                </button>
              </div>
            );
          })
        ) : (
          <div className="no-invoice-wrapper">
            <p>No invoices match your search criteria.</p>
            <button onClick={() => navigate('/new-invoice')}>Create New Invoice</button>
          </div>
        )}
      </div>

      <div className="more">
        <button 
          className='previous-btn' 
          onClick={handlePrevious} 
          disabled={currentPage === 1}
        >
          <FaArrowLeft /> Previous
        </button>
        <button 
          className='next-btn' 
          onClick={handleNext} 
          disabled={currentPage === totalPages}
        >
          Next <FaArrowRight />
        </button>
      </div>
    </>
  );
};

export default Invoices;
