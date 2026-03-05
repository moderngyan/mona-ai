<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class ApiKeyController extends Controller
{
    public function index(Request $request)
    {
        return response()->json($request->user()->tokens()->latest()->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $token = $request->user()->createToken($request->name);

        return response()->json([
            'plainTextToken' => $token->plainTextToken,
            'token' => $token->accessToken
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $token = $request->user()->tokens()->findOrFail($id);
        $token->delete();

        return response()->json(['success' => true]);
    }
}
