type Props = {
    title: string;
    value: string;
    sub?: string;
    extra?: string;
  };
  
  const StatCard = ({ title, value, sub, extra }: Props) => {
    return (
      <div className="stat-card">
        <h4>{title}</h4>
        <p>
          {value} <span>{sub}</span> {extra}
        </p>
      </div>
    );
  };
  
  export default StatCard;
  