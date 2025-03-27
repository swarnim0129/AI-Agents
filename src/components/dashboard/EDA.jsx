import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Checkbox, FormControlLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';

const EDA = ({ data, onDataProcessed }) => {
    const [columns, setColumns] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState([]);
    const [expandedSection, setExpandedSection] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadedData, setUploadedData] = useState(null);
    const [processing, setProcessing] = useState({
        cleaning: false,
        missingValues: false,
        scaling: false,
        encoding: false
    });
    const [previewData, setPreviewData] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [modelType, setModelType] = useState('');
    const [dimensionalityMethod, setDimensionalityMethod] = useState('PCA');
    const [numComponents, setNumComponents] = useState(2);
    const [scalingMethod, setScalingMethod] = useState('Standard Scaling');
    const [columnsToScale, setColumnsToScale] = useState([]);
    const [encodingMethod, setEncodingMethod] = useState('One-Hot Encoding');
    const [columnsToEncode, setColumnsToEncode] = useState([]);
    const [imputationMethod, setImputationMethod] = useState('mean');
    const [columnsToImpute, setColumnsToImpute] = useState([]);
    const [processingInfo, setProcessingInfo] = useState(null);
    const [selectedOperation, setSelectedOperation] = useState(null);
    const [cleaningStatus, setCleaningStatus] = useState({
        cleaned: false,
        rowsBefore: 0,
        rowsAfter: 0
    });

    // Get numeric columns helper function
    const getNumericColumns = () => {
        if (!uploadedData || uploadedData.length === 0) return [];
        return Object.keys(uploadedData[0]).filter(col => 
            !isNaN(parseFloat(uploadedData[0][col]))
        );
    };

    // Get categorical columns helper function
    const getCategoricalColumns = () => {
        if (!uploadedData || uploadedData.length === 0) return [];
        return Object.keys(uploadedData[0]).filter(col => 
            isNaN(parseFloat(uploadedData[0][col]))
        );
    };

    // Handle file upload
    const handleFileUpload = async (file) => {
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const text = e.target.result;
                    const parsedData = await parseCSV(text);
                    setUploadedData(parsedData);
                    setColumns(Object.keys(parsedData[0] || {}));
                    onDataProcessed(parsedData);
                    toast.success('File uploaded successfully!');
                } catch (error) {
                    toast.error('Error parsing file: ' + error.message);
                }
            };
            reader.readAsText(file);
        } catch (error) {
            toast.error('Error reading file: ' + error.message);
        }
    };

    // Update the manual file upload handler
    const handleManualUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    // Update the dropzone onDrop handler
    const onDrop = async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            handleFileUpload(file);
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

    // Handle data processing
    const handleProcessData = async (action) => {
        try {
            setIsProcessing(true);
            console.log('Starting data processing:', action);  // Debug log

            const payload = {
                action,
                data: uploadedData,
                columns: selectedColumns,
                method: imputationMethod
            };
            console.log('Sending payload:', payload);  // Debug log

            const response = await axios.post('http://localhost:5001/api/eda/process-data', payload);
            console.log('Received response:', response.data);  // Debug log

            if (response.data.status === 'success') {
                setUploadedData(response.data.data);
                setColumns(response.data.columns);
                setProcessingInfo(response.data.info);
                setShowPreview(true);
                
                // Update cleaning status if action was 'clean'
                if (action === 'clean') {
                    setCleaningStatus({
                        cleaned: true,
                        rowsBefore: uploadedData.length,
                        rowsAfter: response.data.data.length
                    });
                }
                
                toast.success(response.data.message);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Processing error:', error);
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleGeneratePreview = () => {
        const operations = {
            clean_data: processing.cleaning,
            handle_missing_values: processing.missingValues,
            scale_features: processing.scaling,
            encode_categorical: processing.encoding,
            remove_columns: selectedColumns.length > 0 ? selectedColumns : null
        };
        handleProcessData(operations);
    };

    const FileUploadSection = () => {
        // Add a ref for the hidden file input
        const fileInputRef = React.useRef(null);

        return (
            <Box className="mb-8">
                <Typography variant="h6" className="text-gray-800 mb-4">
                    📊 Upload Dataset
                </Typography>
                
                {/* Manual Upload Button */}
                <div className="mb-4">
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept=".csv"
                        style={{ display: 'none' }}
                        onChange={handleManualUpload}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => fileInputRef.current.click()}
                        className="w-full"
                    >
                        📁 Choose File to Upload
                    </Button>
                </div>

                {/* Drag and Drop Area */}
                <div className="text-center mb-2">
                    <Typography className="text-gray-600">
                        - OR -
                    </Typography>
                </div>

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
                            : 'Drag and drop a CSV file here'}
                    </Typography>
                    <Typography className="text-gray-400 text-sm mt-2">
                        Only CSV files are accepted
                    </Typography>
                </div>

                {/* File Info */}
                {(uploadedData || data) && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <Typography className="text-green-600">
                            ✓ File loaded successfully
                        </Typography>
                        <Typography className="text-green-600 text-sm">
                            Columns: {Object.keys((uploadedData || data)[0] || {}).length} | 
                            Rows: {(uploadedData || data).length}
                        </Typography>
                    </div>
                )}
            </Box>
        );
    };

    const DataProcessingSection = () => (
        <Box className="mt-8">
            {/* Remove Columns Section */}
            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border">
                <div className="flex justify-between items-center cursor-pointer"
                    onClick={() => setExpandedSection(expandedSection === 'remove' ? null : 'remove')}>
                    <Typography className="text-gray-800">❌ Remove Columns</Typography>
                    <span className="text-gray-800">{expandedSection === 'remove' ? '▼' : '▲'}</span>
                </div >
                {expandedSection === 'remove' && uploadedData && (
                    <div className="mt-4 bg-white">
                        <Select
                            multiple
                            value={selectedColumns}
                            onChange={(e) => setSelectedColumns(e.target.value)}
                            className="w-full bg-white "
                            sx={{
                                color: 'black',
                                '.MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(0, 0, 0, 0.23)',
                                },
                            }}
                            MenuProps={{
                                PaperProps: {
                                    style: {
                                        backgroundColor: 'white',
                                        color: 'black'
                                    }
                                }
                            }}
                        >
                            {columns.map(column => (
                                <MenuItem key={column} value={column}>
                                    {column}
                                </MenuItem>
                            ))}
                        </Select>
                        <Button 
                            variant="contained" 
                            className="w-full mt-4"
                            color="primary"
                            onClick={() => handleProcessData('remove_columns')}
                            disabled={selectedColumns.length === 0}
                        >
                            Remove Selected Columns
                        </Button>
                    </div>
                )}
            </div>

            {/* Data Cleaning Section */}
            <div className="mb-4 bg-white rounded-lg">
                <div className="p-4">
                    <div className="flex items-center mb-2">
                        <Checkbox 
                            checked={processing.cleaning}
                            onChange={() => {
                                setProcessing(prev => ({
                                    ...prev,
                                    cleaning: !prev.cleaning
                                }));
                            }}
                            sx={{
                                color: '#3B82F6',
                                '&.Mui-checked': {
                                    color: '#3B82F6'
                                }
                            }}
                        />
                        <span className="mr-2">🧹</span>
                        <Typography>Data Cleaning</Typography>
                    </div>
                    <Typography className="text-gray-600 ml-10 mb-4">
                        Removes duplicates, standardizes data formats, and handles basic data cleaning
                    </Typography>
                    <Button 
                        variant="contained"
                        fullWidth
                        onClick={() => handleProcessData('clean')}
                        disabled={isProcessing}
                        sx={{
                            backgroundColor: '#3B82F6',
                            '&:hover': {
                                backgroundColor: '#2563EB'
                            }
                        }}
                    >
                        Clean Data
                    </Button>
                    
                    {/* Add the success message */}
                    {cleaningStatus.cleaned && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <Typography className="text-green-600 flex items-center">
                                <span className="mr-2">✓</span>
                                Data cleaned successfully
                            </Typography>
                            <Typography className="text-green-600 text-sm mt-1">
                                Removed {cleaningStatus.rowsBefore - cleaningStatus.rowsAfter} duplicate rows
                            </Typography>
                            <Typography className="text-green-600 text-sm">
                                Rows: {cleaningStatus.rowsBefore} → {cleaningStatus.rowsAfter}
                            </Typography>
                        </div>
                    )}
                </div>
            </div>

            {/* Handle Missing Values Section */}
            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm border">
                <FormControlLabel
                    control={
                        <Checkbox 
                            checked={processing.missingValues}
                            onChange={() => {
                                setProcessing(prev => ({
                                    ...prev,
                                    missingValues: !prev.missingValues
                                }));
                            }}
                            disabled={!uploadedData}
                            color="primary"
                        />
                    }
                    label={<span className="text-gray-800">🔍 Handle Missing Values</span>}
                />
                {processing.missingValues && uploadedData && (
                    <div className="mt-4">
                        <Typography className="text-gray-800 mb-2">Imputation Method</Typography>
                        <Select
                            value={imputationMethod}
                            onChange={(e) => setImputationMethod(e.target.value)}
                            className="w-full bg-white mb-4"
                            sx={{ color: 'black' }}
                        >
                            <MenuItem value="mean">Mean</MenuItem>
                            <MenuItem value="median">Median</MenuItem>
                            <MenuItem value="mode">Mode</MenuItem>
                        </Select>
                        <Typography className="text-gray-800 mb-2">Select columns to impute</Typography>
                        <Select
                            multiple
                            value={selectedColumns}
                            onChange={(e) => setSelectedColumns(e.target.value)}
                            className="w-full bg-white"
                            sx={{ color: 'black' }}
                        >   
                        
                            {columns.map(column => (

                                <MenuItem key={column} value={column}>
                                    {column}
                                </MenuItem>
                            ))}
                        </Select>
                        <Button 
                            variant="contained" 
                            color="primary"
                            className="w-full mt-4"
                            onClick={() => handleProcessData('handle_missing')}
                            disabled={selectedColumns.length === 0}
                        >
                            Apply Imputation
                        </Button>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
                <Button 
                    variant="contained" 
                    color="secondary"
                    className="w-full"
                    onClick={() => handleProcessData('reset')}
                    disabled={!uploadedData}
                >
                    🔄 Reset Data Processing
                </Button>
                <Button 
                    variant="contained" 
                    color="primary"
                    className="w-full"
                    onClick={() => {
                        if (uploadedData) {
                            const csvContent = "data:text/csv;charset=utf-8,"
                                + columns.join(",") + "\n"
                                + uploadedData.map(row => columns.map(col => row[col]).join(",")).join("\n");
                            const encodedUri = encodeURI(csvContent);
                            const link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", "processed_data.csv");
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }
                    }}
                    disabled={!uploadedData}
                >
                    💾 Download Processed Data
                </Button>
            </div>
        </Box>
    );

    // Data Preview Component
    const DataPreview = () => (
        <div className="mt-6 bg-white rounded-lg shadow p-4">
            <Typography variant="h6" className="text-gray-800 mb-3">
                Data Preview (First 5 rows)
            </Typography>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map(col => (
                                <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {uploadedData?.slice(0, 5).map((row, idx) => (
                            <tr key={idx}>
                                {columns.map(col => (
                                    <td key={`${idx}-${col}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {row[col]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {processingInfo && (
                <div className="mt-2 text-sm text-gray-600">
                    Showing 5 of {processingInfo.rows} rows
                </div>
            )}
        </div>
    );

    return (
        <div className="p-6">
            <FileUploadSection />
            {(uploadedData || data) && <DataProcessingSection />}
            {showPreview && uploadedData && <DataPreview />}
        </div>
    );
};

export default EDA; 