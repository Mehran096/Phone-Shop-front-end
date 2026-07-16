import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const CompareScreen = () => {
  const { products } = useSelector((state) => state.compare);
//console.log(products);
  const TableRow = ({ title, renderValue }) => (
  <tr className="border-b last:border-b-0">
    <td className="bg-gray-50 font-semibold text-gray-800 px-5 py-4 w-56">
      {title}
    </td>

    {products.map((product) => (
      <td
        key={product._id}
        className="px-5 py-4 text-center"
      >
        {renderValue(product)}
      </td>
    ))}
  </tr>
);

  return (
    <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
  <table className="min-w-[900px] w-full border-collapse">
    <thead>
 <TableRow
  title="Name"
  renderValue={(product) => (
    <span className="font-medium">
      {product.name}
    </span>
  )}
/>

<TableRow
  title="Brand"
  renderValue={(product) => product.brand}
/>
<TableRow
  title="Starting Price"
  renderValue={(product) => (
    <span className="font-semibold text-blue-600">
      ${product.defaultPrice}
    </span>
  )}
/>
<TableRow
  title="Rating"
  renderValue={(product) => (
    <>
      ⭐ {product.rating?.toFixed(1) || 0}
    </>
  )}
/>
<TableRow
  title="Reviews"
  renderValue={(product) => product.numReviews}
 />
 <TableRow
  title="Storage"
  renderValue={(product) => product.defaultStorage}
/>
<TableRow
  title="Colors"
   renderValue={(product) => product.defaultColor}
/>
<TableRow
  title="Display"
  renderValue={(product) => product.specs?.Display}
/> 

<TableRow
  title="RAM"
  renderValue={(product) => product.specs?.RAM}
/>

<TableRow
  title="Rear Camera"
  renderValue={(product) => product.specs?.["Rear Camera"]}
  
/>

<TableRow
  title="Front Camera"
  renderValue={(product) => product.specs?.["Front Camera"] || "-"}
  
/>

<TableRow
  title="Battery"
  renderValue={(product) =>
   product.specs?.Battery
  }
/>

<TableRow
  title="Chipset"
  renderValue={(product) =>
    product.specs?.Chipset || "-"
  }
/>

<TableRow
  title="Operating System"
  renderValue={(product) =>
    product.specs?.OS || "-"
  }
/>

<TableRow
  title="Build"
  renderValue={(product) =>
    product.specs?.Build || "-"
  }
/>
 
</thead>

  </table>
</div>
  );
};

export default CompareScreen;