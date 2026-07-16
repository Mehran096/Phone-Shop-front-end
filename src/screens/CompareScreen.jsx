import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
 
const CompareScreen = () => {
  const { products } = useSelector((state) => state.compare);
  const [selectedVariants, setSelectedVariants] = useState(() => {
  const obj = {};

  products.forEach((product) => {
    obj[product._id] = {
      storage: product.defaultStorage,
      color: product.defaultColor,
    };
  });

  return obj;
});

useEffect(() => {
  const obj = {};

  products.forEach((product) => {
    obj[product._id] = {
      storage: product.defaultStorage,
      color: product.defaultColor,
    };
  });

  setSelectedVariants(obj);
}, [products]);

const getSelectedVariant = (product) => {
  const selected = selectedVariants[product._id];

  return (
    product.variants.find(
      (v) => v.storage === selected?.storage
    ) || product.variants[0]
  );
};

const getSelectedColor = (product) => {
  const variant = getSelectedVariant(product);

  return (
    variant.colors.find(
      (color) => color.name === selectedVariants[product._id]?.color
    ) || variant.colors[0]
  );
};

//const variant = getSelectedVariant(product);
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
 renderValue={(product) => {
  const variant = getSelectedVariant(product);
  return `$${variant.colors[0].price}`;
}}
  
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
  renderValue={(product) =><select
  className="mt-3 w-full border rounded-md p-2"
  value={selectedVariants[product._id]?.storage || ""}
  onChange={(e) =>
    setSelectedVariants((prev) => ({
      ...prev,
      [product._id]: {
        ...prev[product._id],
        storage: e.target.value,
      },
    }))
  }
>
  {product.variants.map((variant) => (
    
    <option
      key={variant.storage}
      value={variant.storage}
    >
      {variant.storage}
    </option>
  ))}
</select>}
/>
<TableRow
  title="Colors"
  renderValue={(product) => {
    const variant = getSelectedVariant(product);
 
    return (
      <select
        className="border rounded-md px-2 py-1 w-full"
        value={selectedVariants[product._id]?.color || ""}
        onChange={(e) =>
          setSelectedVariants((prev) => ({
            ...prev,
            [product._id]: {
              ...prev[product._id],
              color: e.target.value,
            },
          }))
        }
      >
        {variant.colors.map((color) => (
          <option
            key={color.name}
            value={color.name}
          >
            {color.name}
          </option>
        ))}
      </select>
    );
  }}
/>
<TableRow
  title="Display"
  renderValue={(product) => {
    const variant = getSelectedVariant(product);

    return variant.specs?.Display || "-";
  }}
/>

<TableRow
  title="RAM"
  renderValue={(product) => {
    const variant = getSelectedVariant(product);

    return variant.specs?.RAM || "-";
  }}
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
 renderValue={(product) => {
  const variant = getSelectedVariant(product);
  return variant.specs?.Battery || "-";
}}
 
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
  <div className="mt-10">
  <h2 className="text-2xl font-bold mb-4">Performance</h2>

  <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
    <tbody>

      <TableRow
        title="Chipset"
        renderValue={(product) => product.specs?.Chipset || "-"}
      />

      <TableRow
        title="RAM"
        renderValue={(product) => product.specs?.RAM || "-"}
      />

      <TableRow
        title="Storage"
        renderValue={(product) => product.defaultStorage || "-"}
      />

      <TableRow
        title="Operating System"
        renderValue={(product) => product.specs?.OS || "-"}
      />

    </tbody>
  </table>
</div>
<div className="mt-10">
  <h2 className="text-2xl font-bold mb-4">Display</h2>

  <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
    <tbody>

      <TableRow
        title="Display"
        renderValue={(product) => product.specs?.Display || "-"}
      />

    </tbody>
  </table>
</div>
<div className="mt-10">
  <h2 className="text-2xl font-bold mb-4">Camera</h2>

  <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
    <tbody>

      <TableRow
        title="Rear Camera"
        renderValue={(product) => product.specs?.["Rear Camera"] || "-"}
      />

      <TableRow
        title="Front Camera"
        renderValue={(product) => product.specs?.["Front Camera"] || "-"}
      />

    </tbody>
  </table>
</div>
<div className="mt-10">
  <h2 className="text-2xl font-bold mb-4">Battery</h2>

  <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
    <tbody>

      <TableRow
        title="Battery"
        renderValue={(product) => product.specs?.Battery || "-"}
      />

    </tbody>
  </table>
</div>
<div className="mt-10">
  <h2 className="text-2xl font-bold mb-4">Design</h2>

  <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
    <tbody>

      <TableRow
        title="Build"
        renderValue={(product) => product.specs?.Build || "-"}
      />

      <TableRow
        title="Water Resistance"
        renderValue={(product) => product.specs?.["Water Resistance"] || "-"}
      />

      {/* <TableRow
        title="Colors"
        renderValue={(product) =>
          product.defaultColor?.join(", ") || "-"
        }
      /> */}

    </tbody>
  </table>
</div>
<div className="mt-10 mb-10">
  <h2 className="text-2xl font-bold mb-4">Connectivity</h2>

  <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
    <tbody>

      <TableRow
        title="Connectivity"
        renderValue={(product) => product.specs?.Connectivity || "-"}
      />

    </tbody>
  </table>
</div>
</div>
  );
};

export default CompareScreen;