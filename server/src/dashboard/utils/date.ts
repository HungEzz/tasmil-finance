const getDateFromPeriod = (days: number): { from: string; to: string } => {
  const fromDate = new Date();
  const toDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  return {
    from: fromDate.toISOString().split('T')[0],
    to: toDate.toISOString().split('T')[0],
  };
};

export { getDateFromPeriod };
