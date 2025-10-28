// The filters shown on the car listings page

import Tag from "@/src/components/Tag.jsx";

function FilterSelect({ label, options, value, onChange, name, icon }) {
  return (
    <div>
      <img src={icon} alt={label} />
      <label>
        {label}
        <select value={value} onChange={onChange} name={name}>
          {options.map((option, index) => (
            <option value={option} key={index}>
              {option === "" ? "All" : option}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export default function Filters({ filters, setFilters }) {
  const handleSelectionChange = (event, name) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: event.target.value,
    }));
  };

  const updateField = (type, value) => {
    setFilters({ ...filters, [type]: value });
  };

  return (
    <section className="filter">
      <details className="filter-menu">
        <summary>
          <img src="/filter.svg" alt="filter" />
          <div>
            <p>Cars</p>
            <p>Sorted by {filters.sort || "Rating"}</p>
          </div>
        </summary>

        <form
          method="GET"
          onSubmit={(event) => {
            event.preventDefault();
            event.target.parentNode.removeAttribute("open");
          }}
        >
          <FilterSelect
            label="Type"
            options={[
              "",
              "Sedan",
              "SUV",
              "Truck",
              "Sports Car",
              "Coupe",
              "Hatchback",
              "Minivan",
              "Crossover",
              "Convertible",
              "Wagon",
            ]}
            value={filters.type}
            onChange={(event) => handleSelectionChange(event, "type")}
            name="type"
            icon="/food.svg"
          />

          <FilterSelect
            label="Make"
            options={[
              "",
              "Toyota",
              "Honda",
              "Ford",
              "Chevrolet",
              "BMW",
              "Mercedes-Benz",
              "Audi",
              "Nissan",
              "Hyundai",
              "Mazda",
              "Volkswagen",
              "Subaru",
              "Kia",
              "Lexus",
              "Dodge",
              "Jeep",
              "Ram",
              "Tesla",
              "Volvo",
              "Acura",
              "Cadillac",
            ]}
            value={filters.make}
            onChange={(event) => handleSelectionChange(event, "make")}
            name="make"
            icon="/location.svg"
          />

          <FilterSelect
            label="Country of Origin"
            options={[
              "",
              "Japan",
              "USA",
              "Germany",
              "South Korea",
              "Italy",
              "UK",
              "France",
              "Sweden",
            ]}
            value={filters.country}
            onChange={(event) => handleSelectionChange(event, "country")}
            name="country"
            icon="/sortBy.svg"
          />

          <FilterSelect
            label="Price"
            options={["", "$", "$$", "$$$", "$$$$"]}
            value={filters.price}
            onChange={(event) => handleSelectionChange(event, "price")}
            name="price"
            icon="/price.svg"
          />

          <FilterSelect
            label="Sort"
            options={["Rating", "Review"]}
            value={filters.sort}
            onChange={(event) => handleSelectionChange(event, "sort")}
            name="sort"
            icon="/sortBy.svg"
          />

          <footer>
            <menu>
              <button
                className="button--cancel"
                type="reset"
                onClick={() => {
                  setFilters({
                    make: "",
                    type: "",
                    country: "",
                    price: "",
                    sort: "",
                  });
                }}
              >
                Reset
              </button>
              <button type="submit" className="button--confirm">
                Submit
              </button>
            </menu>
          </footer>
        </form>
      </details>

      <div className="tags">
        {Object.entries(filters).map(([type, value]) => {
          // The main filter bar already specifies what
          // sorting is being used. So skip showing the
          // sorting as a 'tag'
          if (type == "sort" || value == "") {
            return null;
          }
          return (
            <Tag
              key={value}
              type={type}
              value={value}
              updateField={updateField}
            />
          );
        })}
      </div>
    </section>
  );
}
