# Chrome Web Store - Privacy Practices Tab

Complete guide for filling out the Privacy practices tab. Copy/paste each section exactly.

---

## ✅ STEP 1: Single Purpose Description (REQUIRED)

**Question:** What is the single purpose of your item?

**Answer to copy/paste:**
```
Automate time entry form filling for ServiceNow incidents and tasks
```

---

## ✅ STEP 2: Permission Justifications (REQUIRED)

### activeTab Permission

**Question:** Why do you need the activeTab permission?

**Answer to copy/paste:**
```
Required to access the currently active ServiceNow tab to fill time entry fields in incident and task forms. The extension only activates when the user clicks the extension icon on a ServiceNow page.
```

---

### scripting Permission

**Question:** Why do you need the scripting permission?

**Answer to copy/paste:**
```
Required to inject scripts into ServiceNow pages to interact with form fields (time_worked, work_start, work_end, work_notes, work_type). The extension programmatically fills these fields when the user selects a time duration.
```

---

### webNavigation Permission

**Question:** Why do you need the webNavigation permission?

**Answer to copy/paste:**
```
Required to detect when users navigate to ServiceNow incident and task pages. This allows the extension to identify the correct context for time entry operations.
```

---

### Host Permission (*.service-now.com)

**Question:** Why do you need host permissions?

**Answer to copy/paste:**
```
Required to access and modify ServiceNow form fields on *.service-now.com domains. The extension only works on ServiceNow instances and needs permission to read and write form data for time entry automation.
```

---

### Remote Code

**Question:** Does your extension execute remote code? If yes, explain why.

**Answer to select:**
```
☐ No, this extension does not execute remote code
```

**Important:** Check "No" - this extension does NOT use remote code. All code is packaged with the extension.

If they still require a justification field, use:
```
This extension does not execute or load any remote code. All functionality is contained within the extension package and runs locally in the user's browser.
```

---

## ✅ STEP 3: Data Usage Certification (REQUIRED)

**Question:** Does your extension collect or transmit user data?

**Answer to select:**
```
☐ No, this extension does not collect or transmit any user data
```

**If there's a text field for data usage, copy/paste:**
```
This extension does not collect, store, or transmit any user data. All operations are performed locally in the browser on ServiceNow pages. No data leaves the user's machine.
```

---

## ✅ STEP 4: Certification of Compliance

**Question:** Certify compliance with Chrome Web Store policies

**Action:** Check the box that says:
```
☑ I certify that this item complies with the Chrome Web Store Developer Program Policies
```

---

## ✅ STEP 5: Contact Email (Account Tab)

**Action:** Go to the **Account** tab and:
1. Enter email: `bartisimo@gmail.com`
2. Click "Send verification email"
3. Check your inbox and click the verification link
4. Return to the extension listing

---

## Quick Checklist

Before submitting:
- [ ] Single purpose description entered
- [ ] activeTab permission justified
- [ ] scripting permission justified
- [ ] webNavigation permission justified
- [ ] Host permission (*.service-now.com) justified
- [ ] Remote code: Selected "No" (or justified as not using remote code)
- [ ] Data usage: Selected "No data collected"
- [ ] Compliance certification checkbox checked
- [ ] Contact email entered: bartisimo@gmail.com
- [ ] Email verified (check inbox for verification link)

---

## Privacy Policy (Optional but Recommended)

If asked for a privacy policy URL, you can use your GitHub repo:
```
https://github.com/barturba/serviceNowAutoFill
```

Or copy/paste this simple privacy statement in STORE_LISTING.md:
```
This extension does not collect, store, or transmit any user data. All time entry operations are performed locally in your browser. No information is sent to external servers. The extension only accesses ServiceNow form fields when you explicitly click the extension icon and select a time duration.
```

---

## Support Information

**Support URL:**
```
https://github.com/barturba/serviceNowAutoFill
```

**Support Email:**
```
bartisimo@gmail.com
```
