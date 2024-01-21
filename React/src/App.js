import React, { useState, useEffect } from 'react';
import api from './api';

const App = () => {
  const [parties, setParties] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    ideology: '',
    founded_year: '',
    is_ruling: false,
  });
  const [editPartyId, setEditPartyId] = useState(null);

  const fetchParties = async () => {
    const response = await api.get('/political_parties/');
    setParties(response.data);
  };

  useEffect(() => {
    fetchParties();
  }, []);

  const handleInputChange = (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setFormData({
      ...formData,
      [event.target.name]: value,
    });
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (editPartyId) {
      // If editing, trigger the PUT request
      await api.put(`/political_parties/${editPartyId}`, formData);
    } else {
      // If not editing, trigger the POST request
      await api.post('/political_parties/', formData);
    }

    // Reset the form and fetch updated political parties
    setFormData({
      name: '',
      ideology: '',
      founded_year: '',
      is_ruling: false,
    });
    setEditPartyId(null);
    fetchParties();
  };

  const handleEdit = (partyId) => {
    // Find the political party by ID and set the form data for editing
    const selectedParty = parties.find((party) => party.id === partyId);
    if (selectedParty) {
      setFormData(selectedParty);
      setEditPartyId(partyId);
    }
  };

  const handleDelete = async (partyId) => {
    // Trigger the DELETE request
    await api.delete(`/political_parties/${partyId}`);
    fetchParties();
  };

  return (
    <div>
      <nav className='navbar navbar-dark bg-primary'>
        <div className='container-fluid'>
          <a className='navbar-brand' href="#">
            Political Party Tracker App
          </a>
        </div>
      </nav>
      
      <div className='container'>
        <form onSubmit={handleFormSubmit}>
          <div className='mb-3 mt-3'>
            <label htmlFor='name' className='form-label'>
              Party Name
            </label>
            <input type='text' className='form-control' id='name' name='name' onChange={handleInputChange} value={formData.name} />
          </div>

          <div className='mb-3'>
            <label htmlFor='ideology' className='form-label'>
              Ideology
            </label>
            <input type='text' className='form-control' id='ideology' name='ideology' onChange={handleInputChange} value={formData.ideology} />
          </div>

          <div className='mb-3'>
            <label htmlFor='founded_year' className='form-label'>
              Founded Year
            </label>
            <input type='text' className='form-control' id='founded_year' name='founded_year' onChange={handleInputChange} value={formData.founded_year} />
          </div>

          <div className='mb-3'>
            <label htmlFor='is_ruling' className='form-label'>
              Ruling Party (Check if True)
            </label>
            <input type='checkbox' id='is_ruling' name='is_ruling' onChange={handleInputChange} value={formData.is_ruling} />
          </div>

          <button type='submit' className='btn btn-primary'>
            {editPartyId ? 'Update' : 'Submit'}
          </button>
        </form>

        <table className='table table-striped table-bordered table-hover'>
          <thead>
            <tr>
              <th>Party Name</th>
              <th>Ideology</th>
              <th>Founded Year</th>
              <th>Ruling Party?</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {parties.map((party) => (
              <tr key={party.id}>
                <td>{party.name}</td>
                <td>{party.ideology}</td>
                <td>{party.founded_year}</td>
                <td>{party.is_ruling ? 'Yes' : 'No'}</td>
                <td>
                  <button
                    type='button'
                    className='btn btn-info btn-sm mx-1'
                    onClick={() => handleEdit(party.id)}
                  >
                    Edit
                  </button>
                  <button
                    type='button'
                    className='btn btn-danger btn-sm'
                    onClick={() => handleDelete(party.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;

