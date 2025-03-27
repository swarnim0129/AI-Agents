import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Checkbox, FormControlLabel, Select, MenuItem, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { toast } from 'react-toastify';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDropzone } from 'react-dropzone';

const EDA = ({ data, onDataProcessed }) => {
    const [columns, setColumns] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [expandedSection, setExpandedSection] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processing, setProcessing] = useState({
        cleaning: false,
        missingValues: false,
        scaling: false,
        encoding: false
    });
    const [data, setData] = useState(null);

    useEffect(() => {
        if (data && data.length > 0) {
            setColumns(Object.keys(data[0]));
        }
    }, [data]);

    const handleProcessData = async (action, columns = null) => {
        try {
            setIsProcessing(true);
            const response = await axios.post('http://localhost:5001/api/eda/process-data', {
                action,
                data: data,
                columns: columns
            });

            if (response.data) {
                onDataProcessed(response.data.data);
                toast.success(`${action} completed successfully`);
            }
        } catch (error) {
            toast.error(`Error during ${action}: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleColumnSelect = (event) => {
        setSelectedColumns(event.target.value);
    };

    const handleCheckboxChange = (processingType) => {
        setProcessing(prev => ({
            ...prev,
            [processingType]: !prev[processingType]
        }));
    };

    const handleProcessedData = (newData) => {
        setData(newData);
        // Update any visualizations or analysis as needed
    };

    // File upload handling
    const onDrop = async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            try {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const text = e.target.result;
                    const parsedData = await parseCSV(text);
                    setData(parsedData);
                    toast.success('File uploaded successfully!');
                };
                reader.readAsText(file);
            } catch (error) {
                toast.error('Error reading file');
            }
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv']
        },
        multiple: false
    });

    const parseCSV = (text) => {
        return new Promise((resolve) => {
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(header => header.trim());
            const result = [];

            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim() === '') continue;
                const obj = {};
                const currentLine = lines[i].split(',');

                for (let j = 0; j < headers.length; j++) {
                    obj[headers[j]] = currentLine[j]?.trim();
                }
                result.push(obj);
            }
            resolve(result);
        });
    };

    // Add the file upload section at the top
    const FileUploadSection = () => (
        <Box className="mb-8">
            <Typography variant="h6" className="text-gray-800 mb-4">
                📊 Upload Dataset
            </Typography>
            <div
                {...getRootProps()}
                className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer 
                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
                    hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200`}
            >
                <input {...getInputProps()} />
                <Typography className="text-gray-600">
                    {isDragActive
                        ? 'Drop the CSV file here...'
                        : 'Drag and drop a CSV file here, or click to select'}
                </Typography>
                <Typography className="text-gray-400 text-sm mt-2">
                    Only CSV files are accepted
                </Typography>
            </div>
            {data && (
                <Typography className="text-green-600 mt-2">
                    ✓ File loaded successfully: {Object.keys(data[0] || {}).length} columns, {data.length} rows
                </Typography>
            )}
        </Box>
    );

    const DataProcessingSection = () => (
        <Box className="mt-8">
            <Typography variant="h6" className="text-gray-800 mb-4">
                🔧 Data Processing Options
            </Typography>

            {/* Remove Columns Section */}
            <div className="bg-white border rounded-lg mb-4 shadow-sm">
                <div className="p-4 cursor-pointer" onClick={() => setExpandedSection(expandedSection === 'remove' ? null : 'remove')}>
                    <div className="flex justify-between items-center">
                        <Typography className="text-gray-800">❌ Remove Columns</Typography>
                        <span>{expandedSection === 'remove' ? '▼' : '▲'}</span>
                    </div>
                </div>
                {expandedSection === 'remove' && (
                    <div className="p-4 border-t">
                        <Select
                            multiple
                            value={selectedColumns}
                            onChange={(e) => setSelectedColumns(e.target.value)}
                            className="w-full bg-white"
                            sx={{ color: 'gray' }}
                        >
                            {data && Object.keys(data[0] || {}).map(column => (
                                <MenuItem key={column} value={column}>
                                    {column}
                                </MenuItem>
                            ))}
                        </Select>
                        <Button 
                            variant="contained" 
                            className="w-full mt-4"
                            color="primary"
                            disabled={!data || isProcessing}
                        >
                            Remove Selected Columns
                        </Button>
                    </div>
                )}
            </div>

            {/* Data Cleaning Section */}
            <div className="bg-white border rounded-lg mb-4 shadow-sm p-4">
                <FormControlLabel
                    control={
                        <Checkbox 
                            disabled={!data || isProcessing}
                            color="primary"
                        />
                    }
                    label={<span className="text-gray-800">🧹 Enable data cleaning</span>}
                />
            </div>

            {/* Handle Missing Values Section */}
            <div className="bg-white border rounded-lg mb-4 shadow-sm p-4">
                <FormControlLabel
                    control={
                        <Checkbox 
                            disabled={!data || isProcessing}
                            color="primary"
                        />
                    }
                    label={<span className="text-gray-800">🔍 Enable missing value imputation</span>}
                />
            </div>

            {/* Scale Features Section */}
            <div className="bg-white border rounded-lg mb-4 shadow-sm p-4">
                <FormControlLabel
                    control={
                        <Checkbox 
                            disabled={!data || isProcessing}
                            color="primary"
                        />
                    }
                    label={<span className="text-gray-800">📏 Enable data scaling</span>}
                />
            </div>

            {/* Encode Categorical Section */}
            <div className="bg-white border rounded-lg mb-4 shadow-sm p-4">
                <FormControlLabel
                    control={
                        <Checkbox 
                            disabled={!data || isProcessing}
                            color="primary"
                        />
                    }
                    label={<span className="text-gray-800">🏷️ Enable categorical encoding</span>}
                />
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
                <Button 
                    variant="contained" 
                    className="w-full"
                    color="secondary"
                    disabled={!data || isProcessing}
                >
                    🔄 Reset Data Processing
                </Button>
                <Button 
                    variant="contained" 
                    className="w-full"
                    color="primary"
                    disabled={!data || isProcessing}
                >
                    💾 Download Processed Data
                </Button>
            </div>
        </Box>
    );

    return (
        <div className="p-6">
            <FileUploadSection />
            {data && <DataProcessingSection />}
        </div>
    );
};

export default EDA; 