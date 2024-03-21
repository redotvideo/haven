import React, { useState, useEffect } from 'react';
import { Button } from '~/components/form/button';
import { getDatasetDetails } from '~/server/controller/dataset';

const DatasetVisualization = ({ selectedDatasetId }) => {
  const [datasetDetails, setDatasetDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDatasetDetails = async () => {
      setIsLoading(true);
      setError('');
      try {
        const details = await getDatasetDetails(selectedDatasetId);
        setDatasetDetails(details);
      } catch (err) {
        setError('Failed to fetch dataset details');
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedDatasetId) {
      fetchDatasetDetails();
    }
  }, [selectedDatasetId]);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!datasetDetails) return <p>No dataset selected</p>;

  return (
    <div>
      <h2>{datasetDetails.name}</h2>
      <p>Rows: {datasetDetails.rows}</p>
      <p>Created: {datasetDetails.created}</p>
      <Button as="a" href={datasetDetails.downloadUrl} download>
        Download Dataset
      </Button>
      <Button onClick={() => {/* visualization logic here */}}>
        Visualize Dataset
      </Button>
    </div>
  );
};

export default DatasetVisualization;
