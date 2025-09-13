const Variables = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Variables</h1>
        <p className="text-muted-foreground">
          Manage environment variables and settings
        </p>
      </div>

      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-foreground mb-2">
          No variables configured
        </h3>
        <p className="text-muted-foreground">
          Create your first variable to get started
        </p>
      </div>
    </div>
  );
};

export default Variables;