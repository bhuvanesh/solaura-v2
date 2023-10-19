import ReactLoading from 'react-loading';

const DataTable = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <ReactLoading type="bars" color="#8000FF" />
      </div>
    );
  }


    return (
    <div style={{ overflowX: 'auto', height: '80vh' ,width:'83vw'}} className=" border-2 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 border rounded-md ">
        <thead className="">
          <tr>
            {Object.keys(data[0]).map((key) => (
              <th
                key={key}
                className="px-6 py-3 text-left text-xs font-medium bg-sky-800 text-white uppercase tracking-wider"
              >
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 cursor-pointer overflow-auto">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-slate-100 focus:bg-slate-200" tabIndex={rowIndex}>
              {Object.values(row).map((value, valueIndex) => (
                <td
                  key={valueIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-sky-800"
                >
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    );
  };

  export default DataTable;