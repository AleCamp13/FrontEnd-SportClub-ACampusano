function FormMessage({ type = 'danger', children }) {
  if (!children) return null;

  return (
    <div className={`alert alert-${type}`} role="alert">
      {children}
    </div>
  );
}

export default FormMessage;

