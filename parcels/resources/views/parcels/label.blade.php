<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Parcel Label - {{ $parcel->tracking_number }}</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif; /* DejaVu Sans supports more characters */
            margin: 0;
            padding: 0;
            font-size: 12px;
        }
        .label-container {
            width: 4in; /* Standard label width */
            height: 6in; /* Standard label height */
            border: 1px solid #000;
            padding: 0.25in;
            position: relative;
        }
        .section {
            margin-bottom: 0.2in;
            padding-bottom: 0.2in;
            border-bottom: 1px dashed #ccc;
        }
        .section:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        .address-block strong {
            display: block;
            font-size: 14px;
            margin-bottom: 0.05in;
        }
        .address-block p {
            margin: 0 0 0.05in 0;
        }
        .barcode-section {
            text-align: center;
            margin-top: 0.3in;
        }
        .tracking-number {
            text-align: center;
            font-weight: bold;
            font-size: 16px;
            margin-top: 0.1in;
        }
        .logo-placeholder {
            text-align: right;
            font-size: 10px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="label-container">
        <div class="logo-placeholder">
            Your Company Name / Logo
        </div>

        <div class="section address-block">
            <strong>FROM:</strong>
            <p>{{ $parcel->sender_name }}</p>
            <p>{{ $parcel->sender_address }}</p>
        </div>

        <div class="section address-block">
            <strong>TO:</strong>
            <p>{{ $parcel->recipient_name }}</p>
            <p>{{ $parcel->recipient_address }}</p>
            @if($parcel->recipient_phone)
                <p>Tel: {{ $parcel->recipient_phone }}</p>
            @endif
        </div>

        <div class="barcode-section">
            <!-- Barcode will be embedded here as an image -->
            <img src="data:image/png;base64,{{ $barcode }}" alt="Barcode" style="width: 3in; height: 0.75in;">
        </div>

        <div class="tracking-number">
            {{ $parcel->tracking_number }}
        </div>

        <div class="section" style="margin-top: 0.2in;">
            <p><strong>Weight:</strong> {{ $parcel->weight ? $parcel->weight . ' kg' : 'N/A' }}</p>
            <p><strong>Dimensions:</strong> {{ $parcel->dimensions ?: 'N/A' }}</p>
        </div>

        <div style="text-align: center; font-size: 10px; margin-top: 0.2in;">
            Generated: {{ date('Y-m-d H:i:s') }}
        </div>
    </div>
</body>
</html>
