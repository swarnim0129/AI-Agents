import MLAnalysis from './MLAnalysis';

function EDA() {
  // ... existing state and functions ...

  return (
    <div>
      {/* ... existing EDA UI ... */}
      
      {file && <MLAnalysis file={file} />}
    </div>
  );
}

export default EDA; 