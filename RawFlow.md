So we are going ahead with problem statement 2,
Problem statement: Build a decentralized lending platform. Create a system that enables secure lending and borrowing for individuals without access to formal banking. The platform should ensure trust, transparency, and dependable repayment without centralized control. Focus on solving identity, risk, and transaction challenges.

My proposed solution:
A gamified (point based) blockchain based wallet for both lender and borrower to lend and borrow money without any involvement from bank except for payments and repayments. The system will contain UI similar to a blockchain wallet with options to lend or borrow money.

basically traditional banking systems for loans include some steps for ekyc of applicant to get approval of loan.
here as well we will do something similar, so applicant verification during during login only to avoid further steps
Verification steps include: - Users upload aadhar & pan (identity verification) - OCR model extracts user details from aadhar and pan uploaded (user can edit after extraction if any errors during extraction) - mobile number extracted will be getting a randomized and unique OTP from the backend to verify authentic information - after user verifies OTP backend will then move on to identify if the one filling the form is a real human and that human is the same human on documents (face matching using an OpenCV model) - next step will be for users to setup biometrics and mPIN (mpin for app unlocking and all) and tPIN for transactions - after above details are done user enters dashboard

Dashboard involves following options: - borrow & lend option (instead of send & receive option on a traditional blockchain wallet) - Active Loans (includes active loan details for both lender and borrower, repayment due for borrower, tenure left for lender) - Nav bar includes home, analytics (here trust score details + history + simulator), history (past loan details), profile

The flow is like:
Let's say a user wants to borrow some money, his request will be visible for other users to lend money (to apply for a loan user enters the amount they need, verifies phone number via OTP, matches the face, enters biometric + tpin, enters their bank details or i dont know how to mock transactions here can you please look into it). Now comes the lender's part (to lend money to any request, the lender clicks on a request click the option to pay, enters their details including e-sign, verifies face + biometric + tpin and pays).
If let's say the amount requested by a borrower is too huge and one lender cant fulfill the request, we will add a feature like group lending (here multiple lenders can lend money to a borrower). During any lender/s and borrower interaction, create a contract to make the transaction legal between them (same for group lending).

Also gamifying the system is better, +1 point for proper and timely repayments (+1 only when a borrower does timely and proper repayments for one entire loan), -1 after penalties (this also after entire loan). +1 means 0.2% decrease in rate of interest, -1 means 0.5% increase in rate of interest. rate of interest can only decrease upto certain limit after that points will pile up and later any points +1 or -1 will be added or subtracted from the piled up points and also rate of interest can decrease upto certain limit.

Now, for storage: - to store the details (i dont want database or anything that can lead to leak or can be attacked so i think on-chain storage is better), so store the customer identity related objects on-chain. - No local storage. - i will be using firebase for handling automated sms and OTPs. (here, reminders should also be sent via SMS). - rest for storage i am leaving upto you

Also for applying for a loan, collateral is needed for traditional banking systems, here instead of collateral we will include multiple guardians or evidences for collateral so later they can be included in legal actions if any.

But i have a doubt, what should be the central platform to store lender's and borrower's money?

additional features: - wallet address will be created using biometric hash of the user (fuzzy extractor) - recovery of the wallet using 2-of-3 guardians approval - lock wallet using SMS - panic mode (if implementing this makes sense) - 0 sensitive data stored - when a request is initialized, user will be needed to renew the request after every 3 days so that user will be upto date with the request whether the loan is sanctioned or not - user can only request upto 2 loans and a certain amount at a time, after 2 loans are repayed then only user can request a new one

Note: B-INR thing is final for transaction
