export function calculateUnpaidBalance(data = { paid: [], unpaid: [] }, totalPayableAmount) {
  let paid = data.paid
  let unpaid = data.unpaid
  let paidTotal = 0.0
  let unpaidTotal = 0.0
  paid.forEach(paidItem => {
    if (paidItem.status >= 1) {
      paidTotal += parseFloat(paidItem.amount)
    }
  })
  unpaid.forEach(unPaidItem => {
    unPaidItem.fields.forEach(unPaidItemField => {
      if (unPaidItemField.name === 'amount' && unPaidItemField.value > 0) {
        unpaidTotal += parseFloat(unPaidItemField.value)
      }
    })
  })
  let currentPaid = (paidTotal + unpaidTotal).toFixed(2)
  let balance = parseFloat(totalPayableAmount) - currentPaid
  return !isNaN(balance) ? balance.toFixed(2) : 0.0
}
