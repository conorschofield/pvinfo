import ElasticSearchAPIConnector from "@elastic/search-ui-elasticsearch-connector";

export default function CustomElasticSearchAPIConnector(config) {
    return new ElasticSearchAPIConnector({
        ...config,
        getQueryFn: (state, queryConfig) => {
            const searchTerm = state.searchTerm;
            // Exclude @timestamp from search fields
            const fields = queryConfig?.search_fields
                ? Object.keys(queryConfig.search_fields).filter(f => f !== "@timestamp")
                : [];
            const keywordFields = fields.map(f => `${f}.keyword`);

            // Build the main query
            let mainQuery = {
                bool: {
                    should: keywordFields.map(field => ({
                        wildcard: {
                            [field]: {
                                value: searchTerm,
                            }
                        }
                    }))
                }
            };
            // Build filters if present
            let filter = [];
            if (state.filters && state.filters.length > 0) {
                filter = state.filters.map(f => {
                    if (
                        f.type === "all" &&
                        f.field === "@timestamp" &&
                        f.values.length === 1 &&
                        typeof f.values[0] === "object" &&
                        f.values[0].from &&
                        f.values[0].to
                    ) {
                        // Date range filter (from Search UI's RangeFilter)
                        return {
                            range: {
                                [f.field]: {
                                    gte: f.values[0].from,
                                    lte: f.values[0].to
                                }
                            }
                        };
                    }
                    return {
                        terms: {
                            [f.field]: f.values
                        }
                    };
                });
            }

            // Combine query and filters
            const finalQuery = filter.length > 0
                ? {
                    bool: {
                        must: [mainQuery],
                        filter: filter
                    }
                }
                : mainQuery;
            return finalQuery;
        }
    });
}
