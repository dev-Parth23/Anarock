import PropertyCard from "./PropertyCard";

export default function PropertyGrid({ properties }) {
  if (!properties.length) {
    return (
      <div className="empty-state">
        <h3>No properties found</h3>
        <p>
          Try changing your city, micromarket or search keyword.
        </p>
      </div>
    );
  }

  return (
    <div className="property-grid">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
        />
      ))}
    </div>
  );
}