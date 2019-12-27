frappe.ui.form.on('Issue', {
	setup: function(frm) {
        frm.set_query('person_in_charge', function() {
            return {
                filters: {
                    'department': ['like', 'Maintenance - %']
                }
            }
        });
        frm.set_query('sub_contractor_contact', function() {
            return {
                filters: {
                    'supplier_group': 'Sub-Contractor'
                }
            }
        });
        frm.fields_dict['materials_required'].grid.get_field('material_request').get_query = function(doc, cdt, cdn) {
            return {
                filters: [
                    ['Material Request', 'docstatus', '=', '0'],
                    ['Material Request', 'docstatus', '=', '1']
                ]
            }
        }
    },
    property_name: function(frm, cdt, cdn) {
        // frappe.msgprint(__("Testing"))
        frappe.model.set_value(cdt, cdn, 'customer', '');
        if (frm.doc.property_name) {
            frappe.call({
                method: 'frappe.client.get_value',
                args: {
                    doctype: 'Property',
                    fieldname: 'status',
                    filters: {
                        name: frm.doc.property_name
                    },
                },
                async: false,
                callback: function(r, rt) {
                    if (r.message) {
                        if (r.message.status == 'On lease' || r.message.status == 'Off Lease in 3 Months') {
                            frappe.call({
                                method: 'frappe.client.get_value',
                                args: {
                                    doctype: 'Lease',
                                    fieldname: 'customer',
                                    filters: {
                                        property: frm.doc.property_name
                                    },
                                },
                                async: false,
                                callback: function(r, rt) {
                                    if (r.message) {
                                        frappe.model.set_value(cdt, cdn, 'customer', r.message.customer);
                                    }
                                }
                            });
                        }
                    }
                }
            });
        }
    }
});
frappe.ui.form.on('Issue Materials Detail', {
    material_request: function(frm, cdt, cdn) {
        var material = locals[cdt][cdn];
        if (material.material_request) {
            frappe.call({
                'method': 'frappe.client.get_value',
                'args': {
                    doctype: 'Material Request',
                    filters: {
                        'name': material.material_request
                    },
                    fieldname: 'status'
                },
                async: false,
                callback: function(r) {
                    frappe.model.set_value(cdt, cdn, 'material_status', r.message.status);
                }
            });
        }
    }
});
