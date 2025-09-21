import { executionService } from '@/lib/executions';
import { workflowService } from '@/lib/workflows';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const FormPage = () => {
  const { execution_id } = useParams();
  const [execution, setExecution] = useState(null);
  const [workflow, setWorkflow] = useState(null);
  const [formNode, setFormNode] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (execution_id) {
      executionService.getExecutionById(execution_id)
        .then(data => {
          setExecution(data);
        })
        .catch(err => {
          setError(err);
        });
    }
  }, [execution_id]);

  useEffect(() => {
    if (execution) {
      workflowService.getWorkflowById(execution.workflow_id)
        .then(data => {
          setWorkflow(data);
        })
        .catch(err => {
          setError(err);
        });
    }
  }, [execution]);

  useEffect(() => {
    if (workflow && execution) {
      const pausedNode = workflow.nodes[execution.paused_node_id];
      if (pausedNode && pausedNode.type === 'form') {
        setFormNode(pausedNode);
      }
      setLoading(false);
    }
  }, [workflow, execution]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executionService.resumeWorkflow(execution_id, formData)
      .then(() => {
        alert('Form submitted successfully!');
        // redirect to a success page or back to the workflows list
      })
      .catch(err => {
        setError(err);
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!formNode) {
    return <div>Form not found or workflow is not paused at a form.</div>;
  }

  return (
    <div>
      <h1>{formNode.template?.title || 'Form'}</h1>
      <p>{formNode.template?.description}</p>
      <form onSubmit={handleSubmit}>
        {formNode.template?.fields?.map(field => (
          <div key={field.name}>
            <label>{field.label}</label>
            <input
              type={field.type || 'text'}
              name={field.name}
              onChange={handleInputChange}
            />
          </div>
        ))}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default FormPage;
