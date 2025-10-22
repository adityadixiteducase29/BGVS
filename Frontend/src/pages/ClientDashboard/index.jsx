import React, { useState, useEffect } from 'react'
import {
  Typography,
  TextField,
  Box,
  Paper,
  CardContent,
  CardHeader,
  Divider,
  Button,
  Tabs,
  Tab
} from '@mui/material'
import { Row, Col } from 'reactstrap'
import { Search, FilterList, People } from '@mui/icons-material'
import './index.css'
import Datatable from "@/components/Datatable"
import apiService from "../../services/api"
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'

const ClientDashboard = () => {
  // State for employees
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get current user from Redux store
  const user = useSelector(state => state.auth.user);

  // Fetch employees data
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      apiService.setToken(token);
      
      // Fetch company employees
      const employeesResponse = await apiService.getCompanyEmployees();

      if (employeesResponse.success) {
        setEmployees(employeesResponse.data);
      } else {
        console.error('Failed to fetch employees:', employeesResponse.message);
        toast.error('Failed to fetch employees');
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const columns = [
    { 
      field: 'id', 
      headerName: 'Employee ID', 
      flex: 1, 
      minWidth: 120,
      headerAlign: 'left',
      renderCell: (data) => (
        <div className="datatable-cell-content">
          {data.row.id}
        </div>
      ) 
    },
    { 
      field: 'name', 
      headerName: 'Employee Name', 
      flex: 1, 
      minWidth: 150,
      headerAlign: 'left',
      renderCell: (data) => (
        <div className="datatable-cell-content">
          {data.row.name}
        </div>
      ) 
    },
    { 
      field: 'email', 
      headerName: 'Email ID', 
      flex: 1, 
      minWidth: 200,
      headerAlign: 'left',
      renderCell: (data) => (
        <div className="datatable-cell-content">
          {data.row.email}
        </div>
      ) 
    },
    { 
      field: 'phone', 
      headerName: 'Phone No.', 
      flex: 1, 
      minWidth: 140,
      headerAlign: 'left',
      renderCell: (data) => (
        <div className="datatable-cell-content">
          {data.row.phone}
        </div>
      ) 
    },
    { 
      field: 'pendingCases', 
      headerName: 'Pending Cases', 
      flex: 1, 
      minWidth: 120,
      headerAlign: 'left',
      renderCell: (data) => {
        const count = data.row.pendingCases;
        const getStatusColor = (count) => {
          if (count === 0) return 'green';
          if (count <= 5) return 'orange';
          return 'red';
        };
        
        const statusColor = getStatusColor(count);
        
        return (
          <div className={`datatable-priority datatable-priority-${statusColor}`}>
            {count}
          </div>
        );
      } 
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="dashboard-title">
          Welcome, {user.full_name || ""}!
        </h1>
        <p className="text-gray-600">Manage your company employees and track verification progress</p>
      </div>
    
      {/* Employees Table */}
      <div>
        <Datatable
          tabledata={employees}
          columns={columns}
          pageSize={10}
        />
      </div>
    </div>
  );
};

export default ClientDashboard;
