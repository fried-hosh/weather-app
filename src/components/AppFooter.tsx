type AppFooterProps = {
  className?: string;
};

const AppFooter = ({ className = "" }: AppFooterProps) => {
  return (
    <footer className={`text-center text-xs ${className}`}>
      <p>
        <small>&copy; 2025 - 2026 fried-hosh</small>
      </p>
    </footer>
  );
};

export default AppFooter;
