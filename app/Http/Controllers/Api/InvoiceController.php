<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Jobs\ProcessInvoiceParsing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class InvoiceController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,png,jpg,jpeg|max:10240',
        ]);

        $path = $request->file('file')->store('invoices');

        $invoice = Invoice::create([
            'file_path' => $path,
            'status' => 'pending',
        ]);

        // Dispatch the background job for processing
        ProcessInvoiceParsing::dispatch($invoice);

        return response()->json([
            'message' => 'Invoice uploaded and queued for processing.',
            'invoice_id' => $invoice->id,
            'status' => 'pending'
        ]);
    }

    public function index()
    {
        return response()->json(Invoice::latest()->get());
    }

    public function status($id)
    {
        $invoice = Invoice::findOrFail($id);

        return response()->json([
            'id' => $invoice->id,
            'status' => $invoice->status,
            'parsed_data' => $invoice->parsed_data,
        ]);
    }
}
