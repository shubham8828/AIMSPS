import Invoice from '../model/InvoiceSchema.js' // Ensure the correct path to your Invoice model
import User from "../model/User.js";
import  Message from "../model/Message.js";
import bcrypt from "bcrypt"; // To hash the password
import jwt from "jsonwebtoken"; // To generate JWT tokens
import cloudinary from "../cloudinary.js";



export const newInvoive = async (req, res) => {
  try {
    // Extract bill data from the request body
    const { to, phone, address, products, total, email } = req.body;

    // Create a new bill instance
    const newInvoice = new Invoice({
      to,
      phone,
      address,
      products,
      total,
      email,
    });

    // Save the new bill to the database
    await newInvoice.save();
      res.status(200).json({ msg: "Invoice created successfully",invoice : newInvoice });
  } catch (error) {
    // Handle errors and send an error response
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};


// Get all invoice at one time this is for Invoices page 
export const invoices = async (req, res) => {
  try {
    const email = req.body.email;
    
    // Query the database with pagination
    const invoices = await Invoice.find({ email });
      
    res.status(200).json({ invoices});
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};


// delete invoice 
export const deleteInvoice= async (req,res)=>{
  try {
    const invoiceId = req.params.id
    
    // Find the invoice by ID and delete it
    const deletedInvoice = await Invoice.findByIdAndDelete(invoiceId)
    
    if (!deletedInvoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Return success message
    res.json({ msg: 'Invoice deleted successfully', invoice: deletedInvoice });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
}

// Update the invoice 

export const updateInvoice = async (req, res) => {
  console.log("updateInvoice")

  const { id } = req.params;
  const updatedInvoice = req.body;
  console.log(updateInvoice)

  try {
    const invoice = await Invoice.findByIdAndUpdate(id, updatedInvoice, { new: true });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.status(200).json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// Search Customer By Name
// Search Customer By Name
export const searchCustomer = async (req, res) => {
  try {
    const { query, email } = req.body;

    // Check if userEmail is provided
    if (!email) {
      return res.status(400).json({ msg: "Missing user email" });
    }

    // Fetch all invoices for the user
    const invoices = await Invoice.find({ email });
    console.log("All invoices:", invoices); // Log invoices for debugging

    // If no invoices are found, return an empty object
    if (!invoices.length) {
      return res.status(200).json({ invoices: [] });
    }

    // If query is not provided, return all invoices with selected fields
    if (!query) {
      const selectedFields = invoices.map(invoice => ({
        invoiceId: invoice.invoiceId,
        to: invoice.to,
        email: invoice.email,
        phone: invoice.phone,
        total: invoice.total,
        date: invoice.date,
        address: invoice.address
      }));
      return res.status(200).json({ invoices: selectedFields });
    }

    const searchRegex = new RegExp(query, "i"); // Create a case-insensitive regex

    // Filter invoices based on the search query and select only required fields
    const filteredInvoices = invoices
      .filter(invoice => {
        return (
          (invoice.to && searchRegex.test(invoice.to)) || // Check for 'to' field
          (invoice.phone && searchRegex.test(invoice.phone)) || // Check for 'phone' field
          (invoice.invoiceId && searchRegex.test(invoice.invoiceId)) || // Check for 'invoiceId' field
          (invoice.email && searchRegex.test(invoice.email)) || // Check for 'email' field
          (invoice.address && searchRegex.test(invoice.address)) // Check for 'address' field
        );
      })
      .map(invoice => ({ // Map to return only the required fields
        invoiceId: invoice.invoiceId,
        to: invoice.to,
        phone: invoice.phone,
        email: invoice.email, // Added email to the response
        address: invoice.address, // Added address to the response
        total: invoice.total,
        date: invoice.date
      }));

    console.log("Filtered invoices:", filteredInvoices); // Log filtered results for debugging

    // Return filtered invoices wrapped in an object
    res.status(200).json({ invoices: filteredInvoices.length > 0 ? filteredInvoices : [] });
  } catch (error) {
    console.error("Error in search API:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};



// Register API For User
export const register = async (req, res) => {
  const { email, name, address, password, image ,phone} = req.body;

  try {
    const existUser = await User.findOne({ email });

    if (existUser) {
      return res.status(400).json({ msg: "User already registered" });
    }

    // Uploading image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(image, {
      upload_preset: "eeeghag0",
      public_id: `${email}_avatar`,
      allowed_formats: ["png", "jpg", "jpeg", "svg"],
    });

    // Check for upload result
    if (!uploadResult || !uploadResult.secure_url) {
      return res.status(500).json({ msg: "Image upload failed" });
    }

    // Fetch optimized URL (if needed)
    const optimizeUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: "auto",
      quality: "auto",
    });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const newUser = new User({
      email,
      name,
      phone,
      address,
      password: hashedPassword, // Store the hashed password
      image: optimizeUrl, // Store the optimized URL or use uploadResult.secure_url
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET // Use your secret key for signing the token
    );

    // Send response with token and user data
    res.status(200).json({
      msg: "User registered successfully",
      token, // JWT token
      user: newUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Login API For User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find the user by email
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Compare the entered password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    // If the passwords do not match, return an error
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Generate a JWT token if the credentials are correct
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET // Use your JWT secret key
    );

    // Return a success response with the token
    return res.status(200).json({ msg: "Login successful", token, user });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Update API For User
export const update = async (req, res) => {
  try {
    const id = req.body._id; // User ID from the body
    const { email, name, address, image } = req.body;

    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Update user fields
    if (email) user.email = email;
    if (name) user.name = name;
    if (address) user.address = address;

    // Handle image upload if an image is provided
    if (image) {
      // Upload image to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(image, {
        upload_preset: "eeeghag0",
        public_id: `${email}_avatar`,
        overwrite:true,
        allowed_formats: ["png", "jpg", "jpeg", "svg"],
      });

      // Check if the upload was successful and set the secure_url to user.image
      if (!uploadResult || !uploadResult.secure_url) {
        return res.status(500).json({ msg: "Image upload failed" });
      }

      user.image = uploadResult.secure_url; // Save the secure_url directly
    }

    await user.save();

    // Return success response with updated user data
    return res.status(200).json({ msg: "User updated successfully", user });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// GetUserDate API For User

export const getUser = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
    if (user) {
      res.status(200).json({ user });
    } else {
      res.status(500).json({ msg: "user Not found" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error" });
  }
};



//  Message API that enable to send the message to addmin for any types of issue or customer support

export const message = async (req, res) => {

  const { name, email, message } = req.body;
  console.log(req.body)

  try {
    // Validate the message data (Optional: You can add more validation here)
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields (name, email, message) are required' });
    }

    // Create a new message instance
    const  newMessage = new  Message({
      name, 
      email,
      message
    });

    // Save the message to the database
    await  newMessage.save();

    // Respond with success
    res.status(201).json({ message: 'Message sent successfully' });

  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: 'Server error' });
  }
};



// Share on whatshap API


export const sendPdf = async (req, res) => {
  const { phoneNumber, pdfData, fileName } = req.body;
    console.log(req.body)
  try {
    await client.sendMessage(phoneNumber + '@c.us', {
      media: {
        type: 'document',
        filename: fileName,
        data: pdfData,
      },
      caption: 'Sharing PDF',
    });
    res.status(200).send('PDF sent successfully!');
  } catch (error) {
    res.status(500).send('Failed to send PDF');
    console.error(error);
  } 
}
  

