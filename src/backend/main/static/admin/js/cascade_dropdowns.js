(function($) {
    $(document).ready(function() {
        console.log('Cascade dropdowns JavaScript loaded');
        
        // Get field elements
        var provinceField = $('#id_province');
        var districtField = $('#id_district');
        var dsDivisionField = $('#id_ds_division');
        var gnDivisionField = $('#id_grama_niladhari_division');
        
        console.log('Found fields:', {
            province: provinceField.length,
            district: districtField.length,
            ds_division: dsDivisionField.length,
            gn_division: gnDivisionField.length
        });

        // Function to filter dropdown options
        function filterDropdown(dropdown, filterValue, filterField, callback) {
            console.log('Filtering dropdown:', dropdown.attr('id'), 'with value:', filterValue, 'field:', filterField);
            
            dropdown.html('<option value="">---------</option>');
            
            if (filterValue) {
                // Make AJAX request to get filtered options
                var url = '/admin/cascade-filter/';
                var data = {};
                data[filterField] = filterValue;
                data['target'] = dropdown.attr('id').replace('id_', '');

                console.log('Making AJAX request to:', url, 'with data:', data);

                $.get(url, data, function(response) {
                    console.log('AJAX response:', response);
                    $.each(response, function(index, item) {
                        dropdown.append('<option value="' + item.id + '">' + item.name + '</option>');
                    });
                    
                    // Call callback if provided
                    if (callback && typeof callback === 'function') {
                        callback();
                    }
                }).fail(function(xhr, status, error) {
                    console.error('AJAX request failed:', status, error);
                });
            }
        }

        // Province change handler
        provinceField.change(function() {
            console.log('Province changed to:', $(this).val());
            var provinceId = $(this).val();
            
            // Clear and filter district dropdown
            filterDropdown(districtField, provinceId, 'province');
            
            // Clear dependent dropdowns
            dsDivisionField.html('<option value="">---------</option>');
            gnDivisionField.html('<option value="">---------</option>');
        });

        // District change handler
        districtField.change(function() {
            console.log('District changed to:', $(this).val());
            var districtId = $(this).val();
            
            // Clear and filter DS division dropdown
            filterDropdown(dsDivisionField, districtId, 'district');
            
            // Clear dependent dropdown
            gnDivisionField.html('<option value="">---------</option>');
        });

        // DS Division change handler
        dsDivisionField.change(function() {
            console.log('DS Division changed to:', $(this).val());
            var dsDivisionId = $(this).val();
            
            // Clear and filter GN division dropdown
            filterDropdown(gnDivisionField, dsDivisionId, 'ds_division');
        });

        // Initialize dropdowns based on existing values (for editing existing users)
        function initializeDropdowns() {
            var provinceId = provinceField.val();
            var districtId = districtField.val();
            var dsDivisionId = dsDivisionField.val();
            var gnDivisionId = gnDivisionField.val();
            
            console.log('Initializing dropdowns with existing values:', {
                province: provinceId,
                district: districtId,
                ds_division: dsDivisionId,
                gn_division: gnDivisionId
            });

            if (provinceId) {
                // Load districts for the selected province
                filterDropdown(districtField, provinceId, 'province', function() {
                    // After districts are loaded, set the selected district
                    if (districtId) {
                        districtField.val(districtId);
                        // Load DS divisions for the selected district
                        filterDropdown(dsDivisionField, districtId, 'district', function() {
                            // After DS divisions are loaded, set the selected DS division
                            if (dsDivisionId) {
                                dsDivisionField.val(dsDivisionId);
                                // Load GN divisions for the selected DS division
                                filterDropdown(gnDivisionField, dsDivisionId, 'ds_division', function() {
                                    // After GN divisions are loaded, set the selected GN division
                                    if (gnDivisionId) {
                                        gnDivisionField.val(gnDivisionId);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }

        // Call initialization after a short delay to ensure DOM is ready
        setTimeout(initializeDropdowns, 100);
    });
})(typeof django !== 'undefined' && django.jQuery ? django.jQuery : jQuery);
