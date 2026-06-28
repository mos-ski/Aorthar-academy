-- Update default contract templates from the supplied Aorthar sample contracts.

DO $$
DECLARE
  employee_template_id uuid;
  contractor_template_id uuid;
  client_template_id uuid;
BEGIN
  SELECT id INTO employee_template_id
  FROM public.contract_templates
  WHERE mode = 'employee' AND name = 'Standard Employee Agreement'
  ORDER BY created_at ASC
  LIMIT 1;

  IF employee_template_id IS NULL THEN
    INSERT INTO public.contract_templates (mode, name, description, content_html, status)
    VALUES ('employee', 'Standard Employee Agreement', 'Default employee offer, terms of engagement, and NDA.', '', 'active')
    RETURNING id INTO employee_template_id;
  END IF;

  UPDATE public.contract_templates
  SET
    description = 'Default employee offer, terms of engagement, and NDA based on the Aorthar x Victoria sample.',
    content_html = $employee$
<h2>Offer Letter</h2>
<p>To: {{employee_name}}<br>{{employee_email}}<br>{{employee_address}}</p>
<p>Dear {{employee_first_name}},</p>
<p>We are delighted to extend this offer for the full-time {{role_title}} role, providing dedicated support to {{principal_name}}. If you accept this offer, your starting date will be {{start_date}}, and you will report directly to {{reporting_manager}}.</p>
<p>We have attached to this letter the terms of your engagement with us. Please contact us via {{company_email}} if you have any questions.</p>
<p>We are looking forward to having you on our team.</p>
<p>Yours faithfully,<br>Aorthar Design Studio<br>{{company_website}}</p>

<h2>Terms of Engagement</h2>
<p>This Agreement is made on {{agreement_date}} between Aorthar Design Studio, whose registered office is at {{company_address}}, and {{employee_name}} of {{employee_address}}.</p>

<h3>1. Definitions and Interpretation</h3>
<p>In this Agreement, "Agreement" means this contract including any schedules, annexures, and appendices. "The Principal" means {{principal_name}}, whom the Professional reports directly to. The clause headings do not form part of this Agreement and shall not be taken into account in its construction or interpretation.</p>

<h3>2. Term of Contract</h3>
<p>The contract commences on {{start_date}} and continues thereafter subject to termination by either party in accordance with this Agreement.</p>

<h3>3. Duties</h3>
<p>Your duties as {{role_title}} shall include providing support to {{principal_name}} across personal and professional responsibilities. These duties include, but are not limited to:</p>
<p>{{duties}}</p>
<p>The above scope may be adjusted by {{principal_name}} or Management at any time with reasonable notice.</p>

<h3>4. Confidentiality and Data Security</h3>
<p>The Professional shall maintain strict confidentiality regarding all sensitive personal and professional information encountered during this engagement, including business strategies, financial details, client data, private affairs, login credentials, access tokens, unreleased work product, creative projects, and intellectual property.</p>
<p>The Professional shall keep all such information confidential, use it solely for assigned duties, immediately notify {{principal_name}} of any actual or suspected breach, and delete or surrender all such materials upon termination. These obligations survive termination indefinitely.</p>

<h3>5. Compensation</h3>
<p>The Professional shall receive a gross salary of {{salary}} per month, payable {{salary_payment_schedule}}. Aorthar will reimburse reasonable and necessary out-of-pocket expenses incurred in the performance of duties where such expenses are pre-approved and supported by valid receipts. The Professional is responsible for all applicable taxes and statutory deductions.</p>

<h3>6. Communication Standards</h3>
<p>The Professional shall respond to {{principal_name}} within {{response_window}} during agreed working hours, proactively report blockers or delays, use agreed communication channels including {{communication_channels}}, confirm receipt of assigned tasks, and maintain a professional and discreet tone in all communications.</p>

<h3>7. Hours and Place of Work</h3>
<p>The Professional shall be available during core hours: {{work_hours}}. The Professional shall remain reachable for time-sensitive requests as reasonably required and provide at least {{absence_notice}} notice for planned absences. The place of work is {{work_location}}.</p>

<h3>8. Intellectual Property</h3>
<p>Any work product or materials produced by the Professional in the course of this contract shall be the exclusive property of {{principal_name}} and/or Aorthar Design Studio. The Professional waives any ownership claims over such work.</p>

<h3>9. Conduct and Professional Standards</h3>
<p>The Professional shall maintain professionalism, exercise discretion regarding schedules, location, and private affairs, avoid conflicts of interest, refrain from leveraging Aorthar's name or network for personal gain, and handle financial tasks with transparency and accuracy.</p>

<h3>10. Probation and Confirmation</h3>
<p>Following successful completion of the probationary period, employment is confirmed effective {{confirmation_date}}.</p>

<h3>11. Termination</h3>
<p>Either party may terminate this Agreement with {{notice_period}} prior written notice. If the Professional is dismissed for gross misconduct, termination may take effect immediately without notice. If the Professional violates this Agreement, causes liability to the Company, is charged with unlawful conduct involving moral turpitude, or misuses Company property, the Agreement may cease immediately and payments may be limited to services properly performed up to termination, subject to any lawful deductions or offsets.</p>

<h3>12. Governing Law and Jurisdiction</h3>
<p>This Agreement is governed by the laws of the Federal Republic of Nigeria, and disputes are subject to the non-exclusive jurisdiction of Nigerian courts.</p>

<h2>Non-Disclosure Agreement</h2>
<h3>13. Acknowledgement of Confidentiality</h3>
<p>The Professional acknowledges that, in the course of providing services, they will have access to confidential, proprietary, and secret information relating to {{principal_name}} and Aorthar Design Studio.</p>
<h3>14. Confidential Information</h3>
<p>Confidential Information includes business plans, marketing strategies, financial information, proprietary data, trade secrets, methods, technical know-how, client and partner data, personal affairs, contacts, personal data, and any other non-public information disclosed orally, in writing, or electronically.</p>
<h3>15. Exclusions</h3>
<p>Confidential Information does not include information that becomes public through no fault of the Professional, was already known on a non-confidential basis, is received from a third party not bound by confidentiality, or is independently developed without use of Confidential Information.</p>
<h3>16. Non-Disclosure Obligations</h3>
<p>The Professional agrees to hold Confidential Information in strict confidence, not disclose or publish it without prior written consent, and use it solely to fulfill duties under this Agreement.</p>
<h3>17. Return of Materials</h3>
<p>Upon termination or request, the Professional shall return or destroy all documents, notes, files, and materials containing Confidential Information.</p>
<h3>18. Survival</h3>
<p>The obligations in this NDA survive termination or expiration indefinitely.</p>

<h2>Agreement and Signatures</h2>
<p>By signing below, both parties confirm that they have read, understood, and agree to the terms and conditions of this Agreement.</p>
<p>Employer: Aorthar Design Studio<br>Employee: {{employee_name}}<br>Date: {{agreement_date}}</p>
$employee$,
    status = 'active'
  WHERE id = employee_template_id;

  DELETE FROM public.contract_template_fields WHERE template_id = employee_template_id;
  INSERT INTO public.contract_template_fields (template_id, mode, key, label, field_type, is_required, help_text, sort_order)
  VALUES
    (employee_template_id, 'employee', 'employee_name', 'Employee Name', 'text', true, 'Full legal name of the employee.', 10),
    (employee_template_id, 'employee', 'employee_first_name', 'Employee First Name', 'text', true, 'First name used in the greeting.', 20),
    (employee_template_id, 'employee', 'employee_email', 'Employee Email', 'email', true, 'Employee email address.', 30),
    (employee_template_id, 'employee', 'employee_address', 'Employee Address', 'address', true, 'Employee residential address.', 40),
    (employee_template_id, 'employee', 'role_title', 'Role Title', 'text', true, 'Job title or position.', 50),
    (employee_template_id, 'employee', 'principal_name', 'Principal or Supervisor', 'text', true, 'Person the employee reports to.', 60),
    (employee_template_id, 'employee', 'reporting_manager', 'Reporting Manager', 'text', true, 'Direct reporting manager.', 70),
    (employee_template_id, 'employee', 'start_date', 'Start Date', 'date', true, 'Employment start date.', 80),
    (employee_template_id, 'employee', 'agreement_date', 'Agreement Date', 'date', true, 'Date of the agreement.', 90),
    (employee_template_id, 'employee', 'company_address', 'Company Address', 'address', true, 'Registered office address.', 100),
    (employee_template_id, 'employee', 'company_email', 'Company Email', 'email', true, 'Company contact email.', 110),
    (employee_template_id, 'employee', 'company_website', 'Company Website', 'url', false, 'Company website.', 120),
    (employee_template_id, 'employee', 'duties', 'Duties', 'long_text', true, 'Role duties and responsibilities.', 130),
    (employee_template_id, 'employee', 'salary', 'Salary', 'money', true, 'Monthly or agreed salary.', 140),
    (employee_template_id, 'employee', 'salary_payment_schedule', 'Salary Payment Schedule', 'text', true, 'Example: on the last day of each month.', 150),
    (employee_template_id, 'employee', 'response_window', 'Response Window', 'text', true, 'Expected response time.', 160),
    (employee_template_id, 'employee', 'communication_channels', 'Communication Channels', 'text', true, 'Approved communication channels.', 170),
    (employee_template_id, 'employee', 'work_hours', 'Work Hours', 'text', true, 'Core working hours.', 180),
    (employee_template_id, 'employee', 'absence_notice', 'Absence Notice', 'text', true, 'Required notice for planned absence.', 190),
    (employee_template_id, 'employee', 'work_location', 'Work Location', 'text', true, 'Remote, onsite, hybrid, or location.', 200),
    (employee_template_id, 'employee', 'confirmation_date', 'Confirmation Date', 'date', false, 'Probation confirmation date if applicable.', 210),
    (employee_template_id, 'employee', 'notice_period', 'Notice Period', 'text', true, 'Termination notice period.', 220);

  SELECT id INTO client_template_id
  FROM public.contract_templates
  WHERE mode = 'client' AND name = 'Standard Client Service Agreement'
  ORDER BY created_at ASC
  LIMIT 1;

  IF client_template_id IS NULL THEN
    INSERT INTO public.contract_templates (mode, name, description, content_html, status)
    VALUES ('client', 'Standard Client Service Agreement', 'Default client engagement contract and service invoice.', '', 'active')
    RETURNING id INTO client_template_id;
  END IF;

  UPDATE public.contract_templates
  SET
    description = 'Default client engagement contract and service invoice based on the Simpli Tax sample.',
    content_html = $client$
<h2>Client Engagement Contract and Service Invoice</h2>
<p>Contract No: {{contract_number}}<br>Date Issued: {{date_issued}}<br>Service Provider: {{provider_name}}<br>Client Name: {{client_name}}<br>Project Title: {{project_title}}<br>Service Type: {{service_type}}<br>Contract Start Date: {{contract_start_date}}<br>Estimated End Date: {{estimated_end_date}}<br>Total Contract Value: {{total_contract_value}}</p>
<p>This document is legally binding upon signature by both parties.</p>

<h3>1. Parties to this Agreement</h3>
<p><strong>Service Provider</strong><br>Business Name: {{provider_name}}<br>Address: {{provider_address}}<br>Phone: {{provider_phone}}<br>Email: {{provider_email}}<br>Business Registration No: {{provider_business_registration}}</p>
<p><strong>Client</strong><br>Name / Business Name: {{client_name}}<br>Address: {{client_address}}<br>Phone: {{client_phone}}<br>Email: {{client_email}}<br>Business Registration No: {{client_business_registration}}</p>

<h3>2. Scope of Work</h3>
<p>{{provider_name}} agrees to deliver the services and deliverables described below. Any work outside this scope requires a separate written amendment.</p>
<h4>2.1 Project Description</h4>
<p>{{project_description}}</p>
<h4>2.2 Deliverables</h4>
<p>{{deliverables}}</p>
<h4>2.3 Exclusions</h4>
<p>The following items are not included unless separately agreed in writing:</p>
<p>{{exclusions}}</p>

<h3>3. Timeline and Milestones</h3>
<p>The project shall be executed according to the timeline below. Timelines may change if the Client delays feedback, approvals, or content provision.</p>
<p>{{milestones}}</p>
<p><strong>Delay Policy:</strong> If the Client fails to provide timely feedback within the agreed review window, timelines will be extended by an equivalent number of days at no additional cost. Delays exceeding {{delay_threshold}} may incur a restart fee.</p>

<h3>4. Communication Protocol</h3>
<p>Primary communication channels:</p>
<p>{{communication_channels}}</p>
<p>The Service Provider will respond to Client messages within {{provider_response_time}}. The Client is expected to respond to requests, feedback, or approvals within {{client_response_time}}. Review calls should be confirmed at least {{call_confirmation_window}} in advance.</p>

<h3>5. Review and Approval Process</h3>
<p>Upon submission of each milestone or deliverable, the Client shall review the work within {{review_window}}, provide written feedback via email or the agreed project tool, and approve the deliverable in writing before the next milestone begins. Silence or non-response after the review window shall be treated as implicit approval.</p>

<h3>6. Responsibilities</h3>
<p><strong>Service Provider Responsibilities:</strong></p>
<p>{{provider_responsibilities}}</p>
<p><strong>Client Responsibilities:</strong></p>
<p>{{client_responsibilities}}</p>

<h3>7. Revisions and Change Requests</h3>
<p>This contract includes {{revision_rounds}} revision rounds per deliverable at no extra charge. A revision means minor changes to existing work. New features or scope changes are not revisions. Additional revisions will be billed at {{additional_revision_rate}} or a flat fee agreed in advance. All change requests must be submitted in writing.</p>

<h3>8. Intellectual Property</h3>
<p>Upon receipt of full payment, the Client shall own all final deliverables produced exclusively for this project, including source files, designs, and documentation. The Service Provider retains ownership of pre-existing frameworks, libraries, templates, methodologies, and tools used to build the deliverables. The Client receives a non-exclusive, perpetual license to use these components as embedded in the final work.</p>
<p>Unless the Client requests confidentiality in writing, the Service Provider may display completed work in portfolio, case studies, and marketing materials. Work in progress remains the intellectual property of the Service Provider until full payment is received.</p>

<h3>9. Confidentiality</h3>
<p>Both parties agree to keep confidential all proprietary information, business data, technical specifications, and trade secrets shared during this engagement. This obligation survives termination for {{confidentiality_period}}.</p>

<h3>10. Termination</h3>
<p>Either party may terminate this contract with {{termination_notice}} written notice if the other party materially breaches the terms and fails to remedy the breach within {{breach_remedy_period}}. If the Client terminates without cause, completed work to date will be invoiced, deposits are non-refundable, and work in progress will be delivered in its current state upon final payment. If the Service Provider terminates without cause, completed deliverables will be handed over and any refund for undelivered work will be issued within {{refund_window}}.</p>

<h3>11. Limitation of Liability</h3>
<p>The Service Provider's total liability under this contract shall not exceed the fees paid by the Client in the {{liability_period}} preceding the claim. The Service Provider is not liable for indirect, incidental, or consequential damages including loss of revenue, data, or business opportunities.</p>

<h3>12. Dispute Resolution and General Terms</h3>
<p>Both parties agree to attempt resolution through good-faith negotiation within {{dispute_negotiation_period}}. If unresolved, the dispute shall be referred to mediation before legal proceedings. This Agreement is governed by the laws of the Federal Republic of Nigeria. Amendments must be made in writing and signed by both parties.</p>

<h2>Invoice</h2>
<p>Invoice No: {{invoice_number}}<br>Invoice Date: {{invoice_date}}<br>Due Date: {{invoice_due_date}}</p>
<p><strong>Billed To</strong><br>{{client_name}}<br>{{client_address}}<br>{{client_email}}</p>
<p><strong>From</strong><br>{{provider_name}}<br>{{provider_email}}</p>
<p><strong>Service Breakdown</strong></p>
<p>{{invoice_items}}</p>
<p>Subtotal: {{subtotal}}<br>Discount: {{discount}}<br>VAT / Tax: {{tax}}<br>Total Due: {{total_due}}</p>
<p><strong>Payment Schedule</strong></p>
<p>{{payment_schedule}}</p>
<p><strong>Payment Options</strong></p>
<p>{{payment_options}}</p>
<p><strong>Late Payment Policy:</strong> {{late_payment_policy}}</p>
<p><strong>Refund Policy:</strong> {{refund_policy}}</p>

<h2>Agreement and Signatures</h2>
<p>By signing below, both parties confirm that they have read, understood, and agree to the terms and conditions set out in this Engagement Contract and Invoice.</p>
<p>Service Provider: {{provider_name}}<br>Client: {{client_name}}<br>Date: {{date_issued}}</p>
$client$,
    status = 'active'
  WHERE id = client_template_id;

  DELETE FROM public.contract_template_fields WHERE template_id = client_template_id;
  INSERT INTO public.contract_template_fields (template_id, mode, key, label, field_type, is_required, help_text, sort_order)
  VALUES
    (client_template_id, 'client', 'contract_number', 'Contract Number', 'text', true, 'Contract reference number.', 10),
    (client_template_id, 'client', 'date_issued', 'Date Issued', 'date', true, 'Date contract is issued.', 20),
    (client_template_id, 'client', 'provider_name', 'Provider Name', 'text', true, 'Service provider name.', 30),
    (client_template_id, 'client', 'provider_address', 'Provider Address', 'address', true, 'Provider address.', 40),
    (client_template_id, 'client', 'provider_phone', 'Provider Phone', 'phone', true, 'Provider phone number.', 50),
    (client_template_id, 'client', 'provider_email', 'Provider Email', 'email', true, 'Provider email.', 60),
    (client_template_id, 'client', 'provider_business_registration', 'Provider Business Registration', 'text', false, 'Provider business registration number if applicable.', 70),
    (client_template_id, 'client', 'client_name', 'Client Name', 'text', true, 'Client legal or business name.', 80),
    (client_template_id, 'client', 'client_address', 'Client Address', 'address', true, 'Client address.', 90),
    (client_template_id, 'client', 'client_phone', 'Client Phone', 'phone', true, 'Client phone number.', 100),
    (client_template_id, 'client', 'client_email', 'Client Email', 'email', true, 'Client email.', 110),
    (client_template_id, 'client', 'client_business_registration', 'Client Business Registration', 'text', false, 'Client business registration number if applicable.', 120),
    (client_template_id, 'client', 'project_title', 'Project Title', 'text', true, 'Project name.', 130),
    (client_template_id, 'client', 'service_type', 'Service Type', 'text', true, 'Type of service.', 140),
    (client_template_id, 'client', 'contract_start_date', 'Contract Start Date', 'date', true, 'Project start date.', 150),
    (client_template_id, 'client', 'estimated_end_date', 'Estimated End Date', 'date', true, 'Estimated completion date.', 160),
    (client_template_id, 'client', 'total_contract_value', 'Total Contract Value', 'money', true, 'Total contract value.', 170),
    (client_template_id, 'client', 'project_description', 'Project Description', 'long_text', true, 'Detailed project description.', 180),
    (client_template_id, 'client', 'deliverables', 'Deliverables', 'long_text', true, 'Deliverables list.', 190),
    (client_template_id, 'client', 'exclusions', 'Exclusions', 'long_text', false, 'Out-of-scope items.', 200),
    (client_template_id, 'client', 'milestones', 'Timeline and Milestones', 'long_text', true, 'Milestone table or notes.', 210),
    (client_template_id, 'client', 'delay_threshold', 'Delay Threshold', 'text', true, 'Delay threshold before restart fee.', 220),
    (client_template_id, 'client', 'communication_channels', 'Communication Channels', 'long_text', true, 'Email, WhatsApp, calls, project tool.', 230),
    (client_template_id, 'client', 'provider_response_time', 'Provider Response Time', 'text', true, 'Provider response time.', 240),
    (client_template_id, 'client', 'client_response_time', 'Client Response Time', 'text', true, 'Client response time.', 250),
    (client_template_id, 'client', 'call_confirmation_window', 'Call Confirmation Window', 'text', true, 'Required call confirmation window.', 260),
    (client_template_id, 'client', 'review_window', 'Review Window', 'text', true, 'Review and approval window.', 270),
    (client_template_id, 'client', 'provider_responsibilities', 'Provider Responsibilities', 'long_text', true, 'Provider obligations.', 280),
    (client_template_id, 'client', 'client_responsibilities', 'Client Responsibilities', 'long_text', true, 'Client obligations.', 290),
    (client_template_id, 'client', 'revision_rounds', 'Revision Rounds', 'text', true, 'Included revision rounds.', 300),
    (client_template_id, 'client', 'additional_revision_rate', 'Additional Revision Rate', 'text', false, 'Rate for extra revisions.', 310),
    (client_template_id, 'client', 'confidentiality_period', 'Confidentiality Period', 'text', true, 'Confidentiality survival period.', 320),
    (client_template_id, 'client', 'termination_notice', 'Termination Notice', 'text', true, 'Termination notice period.', 330),
    (client_template_id, 'client', 'breach_remedy_period', 'Breach Remedy Period', 'text', true, 'Breach cure period.', 340),
    (client_template_id, 'client', 'refund_window', 'Refund Window', 'text', true, 'Refund window.', 350),
    (client_template_id, 'client', 'liability_period', 'Liability Period', 'text', true, 'Liability lookback period.', 360),
    (client_template_id, 'client', 'dispute_negotiation_period', 'Dispute Negotiation Period', 'text', true, 'Good-faith negotiation period.', 370),
    (client_template_id, 'client', 'invoice_number', 'Invoice Number', 'text', true, 'Invoice reference.', 380),
    (client_template_id, 'client', 'invoice_date', 'Invoice Date', 'date', true, 'Invoice date.', 390),
    (client_template_id, 'client', 'invoice_due_date', 'Invoice Due Date', 'date', true, 'Payment due date.', 400),
    (client_template_id, 'client', 'invoice_items', 'Invoice Items', 'long_text', true, 'Service breakdown and amounts.', 410),
    (client_template_id, 'client', 'subtotal', 'Subtotal', 'money', true, 'Subtotal.', 420),
    (client_template_id, 'client', 'discount', 'Discount', 'money', false, 'Discount if applicable.', 430),
    (client_template_id, 'client', 'tax', 'VAT / Tax', 'money', false, 'VAT or tax if applicable.', 440),
    (client_template_id, 'client', 'total_due', 'Total Due', 'money', true, 'Total due.', 450),
    (client_template_id, 'client', 'payment_schedule', 'Payment Schedule', 'long_text', true, 'Deposit, milestone, and final payment schedule.', 460),
    (client_template_id, 'client', 'payment_options', 'Payment Options', 'long_text', true, 'Bank transfer and Paystack details.', 470),
    (client_template_id, 'client', 'late_payment_policy', 'Late Payment Policy', 'long_text', true, 'Late payment policy.', 480),
    (client_template_id, 'client', 'refund_policy', 'Refund Policy', 'long_text', true, 'Refund policy.', 490);

  SELECT id INTO contractor_template_id
  FROM public.contract_templates
  WHERE mode = 'contractor' AND name = 'Standard Contractor Agreement'
  ORDER BY created_at ASC
  LIMIT 1;

  IF contractor_template_id IS NULL THEN
    INSERT INTO public.contract_templates (mode, name, description, content_html, status)
    VALUES ('contractor', 'Standard Contractor Agreement', 'Default independent contractor agreement.', '', 'active')
    RETURNING id INTO contractor_template_id;
  END IF;

  UPDATE public.contract_templates
  SET
    description = 'Default independent contractor agreement adapted from the Aorthar engagement and NDA structures.',
    content_html = $contractor$
<h2>Independent Contractor Agreement</h2>
<p>This Agreement is made on {{agreement_date}} between Aorthar Design Studio, located at {{company_address}}, and {{contractor_name}} of {{contractor_address}}.</p>

<h3>1. Engagement</h3>
<p>Aorthar engages the Contractor to provide {{service_type}} services for {{project_title}}. The Contractor accepts this engagement as an independent contractor and not as an employee, partner, or agent of Aorthar.</p>

<h3>2. Scope of Work and Deliverables</h3>
<p>The Contractor shall produce the following deliverables:</p>
<p>{{deliverables}}</p>
<p>Any work outside this scope requires a written amendment approved by Aorthar before work begins.</p>

<h3>3. Timeline and Milestones</h3>
<p>The Contractor shall follow this timeline:</p>
<p>{{milestones}}</p>
<p>The final delivery deadline is {{deadline}}. Delays caused by unavailable information, late approvals, or dependency blockers shall extend the timeline by the equivalent delay period.</p>

<h3>4. Fees and Payment</h3>
<p>The total contractor fee is {{contractor_fee}}. Payment terms are: {{payment_terms}}. Aorthar may withhold payment for rejected, incomplete, or materially defective deliverables until corrected.</p>

<h3>5. Communication and Reporting</h3>
<p>The Contractor shall communicate through {{communication_channels}}, provide updates every {{update_frequency}}, and report blockers or risks promptly.</p>

<h3>6. Standards and Acceptance</h3>
<p>The Contractor shall perform services professionally, meet the agreed acceptance criteria, and provide {{revision_rounds}} revision rounds for work within scope. Acceptance criteria: {{acceptance_criteria}}.</p>

<h3>7. Confidentiality and Data Security</h3>
<p>The Contractor shall keep confidential all business strategies, financial information, client data, personal information, credentials, unreleased work product, technical materials, and other non-public information received during the engagement. Confidential information shall be used only to perform the agreed services and shall not be disclosed without prior written consent.</p>
<p>Upon termination or request, the Contractor shall return or destroy all materials containing confidential information. These obligations survive termination indefinitely.</p>

<h3>8. Intellectual Property</h3>
<p>Upon full payment, Aorthar shall own the final deliverables produced specifically under this Agreement. The Contractor retains ownership of pre-existing tools, templates, libraries, methods, and know-how, but grants Aorthar a non-exclusive, perpetual license to use those components as embedded in the final work.</p>

<h3>9. Independent Contractor Status</h3>
<p>The Contractor is responsible for taxes, statutory obligations, tools, equipment, and expenses unless otherwise agreed in writing. Nothing in this Agreement creates employment, partnership, or agency.</p>

<h3>10. Termination</h3>
<p>Either party may terminate this Agreement with {{termination_notice}} written notice. Aorthar may terminate immediately for material breach, misconduct, confidentiality breach, or failure to deliver after written notice. On termination, completed accepted work shall be paid for, and unfinished work may be delivered in its current state at Aorthar's request.</p>

<h3>11. Limitation of Liability and Dispute Resolution</h3>
<p>The Contractor's liability shall not exceed fees paid under this Agreement except for fraud, confidentiality breach, or willful misconduct. Parties shall first attempt good-faith resolution within {{dispute_negotiation_period}} before mediation or legal proceedings. This Agreement is governed by the laws of the Federal Republic of Nigeria.</p>

<h2>Agreement and Signatures</h2>
<p>By signing below, both parties confirm that they have read, understood, and agree to the terms of this Independent Contractor Agreement.</p>
<p>Aorthar Design Studio<br>Contractor: {{contractor_name}}<br>Date: {{agreement_date}}</p>
$contractor$,
    status = 'active'
  WHERE id = contractor_template_id;

  DELETE FROM public.contract_template_fields WHERE template_id = contractor_template_id;
  INSERT INTO public.contract_template_fields (template_id, mode, key, label, field_type, is_required, help_text, sort_order)
  VALUES
    (contractor_template_id, 'contractor', 'agreement_date', 'Agreement Date', 'date', true, 'Date of the agreement.', 10),
    (contractor_template_id, 'contractor', 'company_address', 'Company Address', 'address', true, 'Aorthar address.', 20),
    (contractor_template_id, 'contractor', 'contractor_name', 'Contractor Name', 'text', true, 'Full legal name of the contractor.', 30),
    (contractor_template_id, 'contractor', 'contractor_address', 'Contractor Address', 'address', true, 'Contractor address.', 40),
    (contractor_template_id, 'contractor', 'service_type', 'Service Type', 'text', true, 'Type of contractor service.', 50),
    (contractor_template_id, 'contractor', 'project_title', 'Project Title', 'text', true, 'Project or engagement title.', 60),
    (contractor_template_id, 'contractor', 'deliverables', 'Deliverables', 'long_text', true, 'Expected deliverables.', 70),
    (contractor_template_id, 'contractor', 'milestones', 'Milestones', 'long_text', true, 'Milestone timeline.', 80),
    (contractor_template_id, 'contractor', 'deadline', 'Deadline', 'date', true, 'Final delivery deadline.', 90),
    (contractor_template_id, 'contractor', 'contractor_fee', 'Contractor Fee', 'money', true, 'Total contractor fee.', 100),
    (contractor_template_id, 'contractor', 'payment_terms', 'Payment Terms', 'long_text', true, 'Payment schedule or conditions.', 110),
    (contractor_template_id, 'contractor', 'communication_channels', 'Communication Channels', 'text', true, 'Approved communication channels.', 120),
    (contractor_template_id, 'contractor', 'update_frequency', 'Update Frequency', 'text', true, 'Expected update frequency.', 130),
    (contractor_template_id, 'contractor', 'revision_rounds', 'Revision Rounds', 'text', true, 'Included revision rounds.', 140),
    (contractor_template_id, 'contractor', 'acceptance_criteria', 'Acceptance Criteria', 'long_text', true, 'Criteria for accepting deliverables.', 150),
    (contractor_template_id, 'contractor', 'termination_notice', 'Termination Notice', 'text', true, 'Termination notice period.', 160),
    (contractor_template_id, 'contractor', 'dispute_negotiation_period', 'Dispute Negotiation Period', 'text', true, 'Good-faith dispute resolution period.', 170);
END $$;
