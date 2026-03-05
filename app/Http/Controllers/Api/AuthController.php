<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Tenant;
use App\Models\UserPersonalization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('nebula-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
            'tenant' => $user->tenant,
            'personalization' => $user->personalization
        ]);
    }

    public function getPersonalization(Request $request)
    {
        $personalization = $request->user()->personalization ?? 
            UserPersonalization::create(['user_id' => $request->user()->id]);

        return response()->json($personalization);
    }

    public function savePersonalization(Request $request)
    {
        $data = $request->validate([
            'nickname' => 'nullable|string',
            'occupation' => 'nullable|string',
            'about_you' => 'nullable|string',
            'custom_instructions' => 'nullable|string',
            'base_tone' => 'nullable|string',
            'memory_enabled' => 'nullable|boolean',
        ]);

        $personalization = UserPersonalization::updateOrCreate(
            ['user_id' => $request->user()->id],
            $data
        );

        return response()->json($personalization);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}
