// Rize Yaşam Simülasyonu — Para, sepet ve kasa mantığı (motordan bağımsız)
//
// Para birimi kuruş cinsinden tam sayı tutulur (1 TL = 100 kuruş). Kayan nokta
// yuvarlama hataları kasada "0,01 TL eksik" gibi saçma durumlar yaratmasın diye.

#pragma once

#include <cstdint>
#include <string>
#include <vector>

namespace RizeSim
{
	using FKurus = int64_t;

	/** 1234 kuruş → "12,34 TL" (Türkçe ondalık virgül). */
	inline std::string FormatTL(FKurus Amount)
	{
		const bool bNeg = Amount < 0;
		const FKurus Abs = bNeg ? -Amount : Amount;
		const FKurus Lira = Abs / 100;
		const FKurus Kurus = Abs % 100;

		// Binlik ayırıcı: nokta (1.250,00 TL)
		std::string LiraStr = std::to_string(Lira);
		for (int i = (int)LiraStr.size() - 3; i > 0; i -= 3) LiraStr.insert((size_t)i, ".");

		std::string Out = bNeg ? "-" : "";
		Out += LiraStr;
		Out += ",";
		if (Kurus < 10) Out += "0";
		Out += std::to_string(Kurus);
		Out += " TL";
		return Out;
	}

	struct FCartLine
	{
		std::string ProductId;
		FKurus UnitPrice = 0;
		int Quantity = 0;
		FKurus LineTotal() const { return UnitPrice * (FKurus)Quantity; }
	};

	enum class ECheckoutResult : uint8_t
	{
		Ok,
		EmptyCart,
		InsufficientFunds,
		ShopClosed
	};

	class FCart
	{
	public:
		/** Ürün ekler; aynı ürün varsa adedi artırır. Stok sınırı çağırana aittir. */
		void Add(const std::string& ProductId, FKurus UnitPrice, int Quantity = 1)
		{
			if (Quantity <= 0) return;
			for (FCartLine& L : Lines)
			{
				if (L.ProductId == ProductId) { L.Quantity += Quantity; return; }
			}
			Lines.push_back({ProductId, UnitPrice, Quantity});
		}

		/** Ürünü rafa geri bırakır. Kaldırılan adedi döndürür. */
		int Remove(const std::string& ProductId, int Quantity = 1)
		{
			for (size_t i = 0; i < Lines.size(); ++i)
			{
				if (Lines[i].ProductId != ProductId) continue;
				const int Removed = Quantity >= Lines[i].Quantity ? Lines[i].Quantity : Quantity;
				Lines[i].Quantity -= Removed;
				if (Lines[i].Quantity <= 0) Lines.erase(Lines.begin() + (long)i);
				return Removed;
			}
			return 0;
		}

		int CountOf(const std::string& ProductId) const
		{
			for (const FCartLine& L : Lines) if (L.ProductId == ProductId) return L.Quantity;
			return 0;
		}

		FKurus Total() const
		{
			FKurus T = 0;
			for (const FCartLine& L : Lines) T += L.LineTotal();
			return T;
		}

		bool IsEmpty() const { return Lines.empty(); }
		const std::vector<FCartLine>& GetLines() const { return Lines; }
		void Clear() { Lines.clear(); }

		/** Kasada ödeme. Başarılıysa cüzdandan düşer ve sepeti boşaltır. */
		ECheckoutResult Checkout(FKurus& InOutWallet, bool bShopOpen)
		{
			if (!bShopOpen) return ECheckoutResult::ShopClosed;
			if (Lines.empty()) return ECheckoutResult::EmptyCart;
			const FKurus T = Total();
			if (T > InOutWallet) return ECheckoutResult::InsufficientFunds;
			InOutWallet -= T;
			Lines.clear();
			return ECheckoutResult::Ok;
		}

	private:
		std::vector<FCartLine> Lines;
	};
}
