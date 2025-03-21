<td className="text-right">{calculateSubtotal().toFixed(2)} DH</td>
            </tr>
            <tr>
              <td colSpan={3} className="text-right font-medium">Total:</td>
              <td className="text-right">{calculateTotal().toFixed(2)} DH</td>
            </tr>
            <tr>
              <td colSpan={3} className="text-right font-medium">Advance Payment:</td>
              <td className="text-right">{advancePayment} DH</td>
            </tr>
            <tr>
              <td colSpan={3} className="text-right font-medium">Balance Due:</td>
              <td className="text-right">{calculateBalance().toFixed(2)} DH</td>